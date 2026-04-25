load("pixiv.js");

function execute() {
    if (!hasLogin()) {
        return Response.success([
            buildLoginRequiredTab()
        ]);
    }

    var favoriteTags = [];
    var tags = [];
    var seen = {};
    var result = [];

    result.push({ title: "Discovery", input: "discovery", script: "home_feed.js" });
    result.push({ title: "Watchlist", input: "watch_list", script: "home_feed.js" });
    result.push({ title: "Bookmarks", input: "bookmarks", script: "home_feed.js" });
    result.push({ title: "Follow latest", input: "follow_latest", script: "home_feed.js" });

    var userId = getCurrentUserId();
    getBookmarkTagNames(userId).forEach(function (tag) {
        if (!seen[tag]) {
            seen[tag] = true;
            favoriteTags.push(tag);
        }
    });

    getTopTagNames().forEach(function (tag) {
        if (!seen[tag]) {
            seen[tag] = true;
            tags.push(tag);
        }
    });

    favoriteTags.forEach(function (tag) {
        result.push(buildFavoriteTagItem(tag));
    });

    tags.forEach(function (tag) {
        result.push(buildTagItem(tag));
    });

    return Response.success(result);
}
