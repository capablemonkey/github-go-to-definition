class CTagger

  TMP_PATH = 'tmp'
  ZIPS_PATH = "#{TMP_PATH}/zips"
  COMMITS_PATH = "#{TMP_PATH}/commits"
  TAGS_PATH = "#{TMP_PATH}/tags"

  def initialize(repo_slug, commit_hash)
    @repo_slug = repo_slug
    @commit_hash = commit_hash
  end

  def self.create_directories
    `mkdir #{TMP_PATH}`
    `mkdir #{ZIPS_PATH}`
    `mkdir #{COMMITS_PATH}`
    `mkdir #{TAGS_PATH}`
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
      "#{ZIPS_PATH}/#{@commit_hash}.zip"
    end

    def commit_path
      "#{COMMITS_PATH}/#{@commit_hash}"
    end

    def clean_filename(commit_path)
      commit_path.gsub("#{COMMITS_PATH}/", '')
    end

    def tags_path
      "#{TAGS_PATH}/#{@commit_hash}.tags"
    end
end
