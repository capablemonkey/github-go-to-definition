require 'sinatra'
require 'open-uri'
require 'ctags_reader'
require 'json'
require_relative 'ctagger'

CTagger.create_directories

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
  ctagger.generate_tags # if !ctagger.tags_exist?
  results = ctagger.lookup_tag(tag)

  ctagger.cleanup

  response = {
    :found => results.size > 0,
    :results => results
  }

  response.to_json
end