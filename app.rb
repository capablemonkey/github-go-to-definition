require 'sinatra'
require 'open-uri'
require 'ctags_reader'
require 'json'

get '/' do
  "Hello!"
end

post '/build_ctags' do
  # ?repo_slug=grnhse/greenhouse_io&commit=aa96494a1674d5288148d2356fbec84ae5e46bdc

  repo_slug = params[:repo_slug]
  commit_hash = params[:commit]
  return 400 if repo_slug.nil? || commit_hash.nil?

  ctagger = CTagger.new(repo_slug, commit_hash)

  return 200 if ctagger.tags_exist?

  ctagger.generate_tags

  200
end

get '/definition' do
  commit_hash = params[:commit]
  tag = params[:tag]

  return 400 if commit_hash.nil? || tag.nil?

  {
    :found => true,
    :results => [
      {
        :filename => '',
        :url => '',
        :line_number => ''
      }
    ]
  }.to_json
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
    cleanup
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

    def cleanup
      `rm -rf #{commit_path}`
      `rm #{zip_path}`
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

    def tags_path
      "tags/#{@commit_hash}.tags"
    end
end

