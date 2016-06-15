FROM ruby:2.1-onbuild
RUN apt-get -y update
RUN apt-get -y install ctags unzip
EXPOSE 80
CMD bundle exec ruby app.rb -p 80 -o 0.0.0.0