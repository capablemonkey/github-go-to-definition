require 'sinatra'
require 'digest/sha2'
require 'open-uri'

get '/' do
  "Hello!"
end

post '/build_ctags' do
  # ?repo_slug=grnhse/greenhouse_io&branch=master&commit=aa96494a1674d5288148d2356fbec84ae5e46bdc

  repo_slug = params[:repo_slug]
  branch = params[:branch]
  return 400 if repo_slug.nil? || branch.nil?

  # TODO: validate repo_url with regex
  branch_path = download_branch(repo_slug, branch)
  build_ctags(branch_path)

  200
end

get '/definition?tag=&file=' do

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

def move_up_one_directory(directory)
  `mv #{directory}/*/* #{directory}/`
end

def download_branch(repo_slug, branch)
  url = path_to_zip(repo_slug, branch)
  signature = branch_signature(repo_slug, branch)
  destination_zip = "./tmp/zips/#{signature}.zip"
  download_file(url, destination_zip)

  unpack_path = "./repos/#{signature}"
  unzip_file(destination_zip, unpack_path)
  move_up_one_directory(unpack_path)

  unpack_path
end

def repo_path(repo_slug, branch)
  "./repos/#{branch_signature(repo_slug, branch)}"
end

def build_ctags(directory)
  `ctags -R #{directory}`
end