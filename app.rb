require 'sinatra'
require 'open-uri'
require 'ctags_reader'
require 'json'

get '/' do
  headers( "Access-Control-Allow-Origin" => "*" )
  "Hello!"
end

get '/definition' do
  headers( "Access-Control-Allow-Origin" => "*" )

  repo_slug = params[:repo_slug]
  commit_hash = params[:commit]
  tag = params[:tag]

  return 400 if repo_slug.nil? || commit_hash.nil? || tag.nil?

  ctagger = CTagger.new(repo_slug, commit_hash)
  ctagger.generate_tags if !ctagger.tags_exist?
  results = ctagger.lookup_tag(tag)

  ctagger.cleanup

  response = {
    :found => results.size > 0,
    :results => results
  }

  response.to_json
end

class CTagger

  def initialize(repo_slug, commit_hash)
    @repo_slug = repo_slug
    @commit_hash = commit_hash
  end

  def tags_exist?
    File.file?(tags_path)
  end

  def generate_tags
    download_commit
    build_ctags
  end

  def lookup_tag(tag)
    reader = CtagsReader.read(tags_path)
    reader.find_all(tag).map do |result|
      filename = clean_filename(result.filename)
      {
        :filename => filename,
        :url => "https://github.com/#{@repo_slug}/blob/#{filename}",
        :line_number => result.line_number,
        :line => result.ex_command
      }
    end
  end

  def cleanup
    # TODO: beware... check to make sure this commit path is not evil.
    `rm -rf #{commit_path}`
    `rm #{zip_path}`
  end

  private

    def path_to_commit_zip
      "https://codeload.github.com/#{@repo_slug}/zip/#{@commit_hash}"
    end

    def download_file(url, destination)
      IO.copy_stream(open(url), File.open(destination, 'w+'))
    end

    def unzip_file(zip_path, destination_path)
      `unzip #{zip_path} -d #{destination_path}`
    end

    def move_up_one_directory(directory)
      `mv #{directory}/*/* #{directory}/`
    end

    def download_commit
      download_file(path_to_commit_zip, zip_path)
      unzip_file(zip_path, commit_path)
      move_up_one_directory(commit_path)
    end

    def build_ctags
      `ctags -o #{tags_path} -R #{commit_path}`
    end

    def zip_path
      "./tmp/zips/#{@commit_hash}.zip"
    end

    def commit_path
      "./commits/#{@commit_hash}"
    end

    def clean_filename(commit_path)
      commit_path.gsub('./commits/', '')
    end

    def tags_path
      "tags/#{@commit_hash}.tags"
    end
end

