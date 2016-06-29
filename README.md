# GitHub Go To Definition

![demo video](https://cloud.githubusercontent.com/assets/1661310/16393966/eb1308ae-3c80-11e6-855a-5307593d6671.gif)

This Chrome extension lets you jump to the definition of a variable, class, method or function when you're reviewing a diff in a pull request or viewing a file on GitHub.

Just right click on a token and choose 'Go to definition'.  We'll scour the project for any definitions and let you open them in a new tab.

[Get the extension!](https://chrome.google.com/webstore/detail/github-go-to-definition/mnmfgfhdkhohgigpepkfjfeigkhfjhdj)

## How it works

The Chrome extension is paired with a Sinatra server which, given a GitHub repo, a commit hash and a token to search for: downloads the repo as a zip, generates a ctags file for it and searches the index for the token.

For public use, I've hosted this service on Google App Engine at https://github-ctags.gordn.org.

## Limitations

- Doesn't work with private repositories yet, since the remote server somehow needs the authorization to download a private repo.
- Will probably be slow for repos with 100MB+ of code (not total repo size, but actual file size)

## Running locally

This project contains a chrome extension (located in `/chrome_extension/`) and a Ruby Sinatra backend server.

#### Server
To get the server running, you can either build a Docker image using the `Dockerfile` or follow the following instructions.  You'll need Ruby 2+ and Bundler installed.

Install dependencies

```
bundle install
```

You'll also need to have `ctags` and `unzip` installed.  Here's how to do that in Mac OS X:

```
brew install ctags
```

Run server (default port is 4567)

```
bundle exec ruby app.rb -p {PORT}
```

Whatever port this is running on, you'll want to update `/chrome_extension/background.js` to point to `http://localhost:{PORT}/definition?...`

#### Chrome extension

1. Go to [chrome://extensions/](chrome://extensions/)
2. Tick the 'Developer mode' checkbox
3. Click 'Load unpacked extension...' and then open the `/chrome_extension/` directory from the file browser.

## Contributing

All suggestions and contributions are welcome!  Feel free to open up an issue or throw some pull requests over.