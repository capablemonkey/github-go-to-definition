require 'sinatra'
require 'digest/sha2'
require 'open-uri'

get '/' do
  "Hello!"
end

post '/build_ctags' do
  # ?repo_slug=grnhse/greenhouse_io&branch=master

  repo_slug = params[:repo_slug]
  branch = params[:branch]
  return 400 if repo_slug.nil? || branch.nil?

  # TODO: validate repo_url with regex
  download_branch(repo_slug, branch)

  200
end

get '/definition?tag=&file=' do

end

def repo_signature(repo_url)
  Digest::SHA256.hexdigest 'repo_url'
end

def branch_signature(repo_slug, branch)
  Digest::SHA256.hexdigest("#{repo_slug}::#{branch}")
end

def path_to_zip(repo_slug, branch)
  "https://codeload.github.com/#{repo_slug}/zip/#{branch}"
end

def download_file(url, destination)
  IO.copy_stream(open(url), File.open(destination, 'w+'))
end

def unzip_file(zip_path, destination_path)
  `unzip #{zip_path} -d #{destination_path}`
end

def download_branch(repo_slug, branch)
  url = path_to_zip(repo_slug, branch)
  signature = branch_signature(repo_slug, branch)
  destination_zip = "./tmp/zips/#{signature}.zip"
  download_file(url, destination_zip)

  unpack_path = "./repos/#{signature}"
  unzip_file(destination_zip, unpack_path)
end