# github_ctags

![demo video](https://cloud.githubusercontent.com/assets/1661310/16393966/eb1308ae-3c80-11e6-855a-5307593d6671.gif)

This Chrome extension lets you jump to the definition of a variable, class, method or function when viewing a diff in a pull request or browsing a file on GitHub.

Adds a context menu item.  Just select the token, right click on it and click 'Go to definition'!

[Get the extension!](https://chrome.google.com/webstore/detail/github-ctags/mnmfgfhdkhohgigpepkfjfeigkhfjhdj)

## Running locally

This project contains a chrome extension (located in `/chrome_extension/`) and a Ruby Sinatra backend server.

#### Server
To get the server running, you can either build a Docker image using the `Dockerfile` or follow the following instructions.  You'll need Ruby 2+ and Bundler installed.

1. Install dependencies

```
bundle install
```

2. Run server (default port is 4567)

```
bundle exec ruby app.rb -p {PORT}
```

3. Whatever port this is running on, you'll want to update `chrome_extension/background.js` to point to `http://localhost:{PORT}/definition?...`

#### Chrome extension

1. Go to [chrome://extensions/](chrome://extensions/)
2. Tick the 'Developer mode' checkbox
3. Click 'Load unpacked extension...' and then open the `/chrome_extension/` directory from the file browser.

## Contributing

All suggestions and contributions are welcome!  Feel free to open up an issue or throw some pull requests over.