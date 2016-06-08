require 'sinatra'
require 'digest/sha2'
require 'open-uri'
require 'ctags_reader'

# TODO: Just store ctags as {commit_hash}.tags.  clean up zip and files.  future API calls just require the last commit hash.

get '/' do
  "Hello!"
end

post '/build_ctags' do
  # ?repo_slug=grnhse/greenhouse_io&commit=aa96494a1674d5288148d2356fbec84ae5e46bdc

  repo_slug = params[:repo_slug]
  commit_hash = params[:commit]
  return 400 if repo_slug.nil? || commit_hash.nil?

  return 200 if tags_exist?(commit_hash)

  # TODO: validate repo_url with regex
  commit_path = download_commit(repo_slug, commit_hash)
  build_ctags(commit_path, commit_hash)
  cleanup_for_commit(commit_hash)

  200
end

get '/definition?tag=&commit=' do
  {
    :found => true,
    :results => [
      {
        :filename => '',
        :url => '',
        :line_number => ''
      }
    ]
  }
end

def path_to_commit_zip(repo_slug, commit_hash)
  "https://codeload.github.com/#{repo_slug}/zip/#{commit_hash}"
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

def download_commit(repo_slug, commit_hash)
  url = path_to_commit_zip(repo_slug, commit_hash)
  zip = zip_path(commit_hash)
  download_file(url, zip)

  unpack_path = commit_path(commit_hash)
  unzip_file(zip, unpack_path)
  move_up_one_directory(unpack_path)

  unpack_path
end

def cleanup_for_commit(commit_hash)
  `rm -rf #{commit_path(commit_hash)}`
  `rm #{zip_path(commit_hash)}`
end

def zip_path(commit_hash)
  "./tmp/zips/#{commit_hash}.zip"
end

def commit_path(commit_hash)
  "./commits/#{commit_hash}"
end

def build_ctags(directory, commit_hash)
  `ctags -o #{tags_path(commit_hash)} -R #{directory}`
end

def tags_path(commit_hash)
  "tags/#{commit_hash}.tags"
end

def tags_exist?(commit_hash)
  File.file?(tags_path(commit_hash))
end