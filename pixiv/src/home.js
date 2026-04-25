load("pixiv.js");

function execute() {
    var tabs = [
        { title: "Discovery", input: "discovery", script: "home_feed.js" }
    ];

    if (hasLogin()) {
        tabs.push({ title: "Follow latest", input: "follow_latest", script: "home_feed.js" });
        tabs.push({ title: "Watchlist", input: "watch_list", script: "home_feed.js" });
        tabs.push({ title: "Bookmarks", input: "bookmarks", script: "home_feed.js" });
    }

    return Response.success(tabs);
}
