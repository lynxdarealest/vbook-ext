load("pixiv.js");

function execute() {
    var tags = [];
    var seen = {};
    var result = [];

    result.push({ title: "Discovery", input: "discovery", script: "home_feed.js" });
    result.push({ title: "Top picks", input: "top", script: "home_feed.js" });

    if (hasLogin()) {
        result.push({ title: "Watchlist", input: "watch_list", script: "home_feed.js" });
        result.push({ title: "Bookmarks", input: "bookmarks", script: "home_feed.js" });
        result.push({ title: "Follow latest", input: "follow_latest", script: "home_feed.js" });

        var userId = getCurrentUserId();
        getBookmarkTagNames(userId).forEach(function (tag) {
            if (!seen[tag]) {
                seen[tag] = true;
                tags.push(tag);
            }
        });
    }

    getTopTagNames().forEach(function (tag) {
        if (!seen[tag]) {
            seen[tag] = true;
            tags.push(tag);
        }
    });

    tags.forEach(function (tag) {
        result.push(buildTagItem(tag));
    });

    return Response.success(result);
}
