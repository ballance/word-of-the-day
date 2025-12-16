function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // Check if the URI ends with a slash
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // Check if the URI has no file extension (doesn't contain a dot after the last slash)
    else if (!uri.includes('.') || uri.lastIndexOf('/') > uri.lastIndexOf('.')) {
        request.uri += '/index.html';
    }

    return request;
}
