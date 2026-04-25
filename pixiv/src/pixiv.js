var BASE_URL = "https://www.pixiv.net";

function makeHeaders(referer) {
    return {
        "User-Agent": "Mozilla/5.0",
        "Referer": referer || BASE_URL,
        "Accept": "application/json"
    };
}

function fetchJson(url, referer) {
    var response = fetch(url, {
        headers: makeHeaders(referer)
    });
    if (!response.ok) return null;
    var data = response.json();
    if (!data || data.error) return null;
    return data.body || data;
}

function escapeHtml(text) {
    if (text == null) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function stripHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+\n/g, "\n")
        .replace(/\n\s+/g, "\n")
        .trim();
}

function parseNovelId(url) {
    var match = /show\.php\?id=(\d+)/.exec(url || "");
    return match ? match[1] : "";
}

function renderContentHtml(detailBody) {
    var images = detailBody.textEmbeddedImages || {};
    var text = detailBody.content || "";
    var tokens = [];
    text = text.replace(/\[uploadedimage:(\d+)\]/g, function (_all, imageId) {
        var token = "__PIXIV_IMAGE_" + imageId + "__";
        var image = images[imageId] || {};
        var urls = image.urls || {};
        tokens.push({
            key: token,
            html: "<br><img src=\"" + (urls.original || urls["1200x1200"] || urls["480mw"] || urls["240mw"] || "") + "\" /><br>"
        });
        return token;
    });
    text = escapeHtml(text).replace(/\r?\n/g, "<br>");
    for (var index = 0; index < tokens.length; index++) {
        text = text.replace(new RegExp(tokens[index].key, "g"), tokens[index].html);
    }
    return text;
}
