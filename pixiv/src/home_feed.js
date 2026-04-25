load("pixiv.js");

function execute(input, page) {
    page = parseInt(page || "1", 10);
    var items = [];
    var next = null;

    if (input === "login_required" || (isLoginOnlyFeed(input) && !hasLogin())) {
        return Response.success([buildLoginRequiredCard()]);
    } else if (input === "discovery") {
        items = getDiscoveryNovels().map(normalizeNovelCard);
    } else if (input === "top") {
        items = getTopNovels().map(normalizeNovelCard);
    } else if (input === "follow_latest") {
        items = getFollowLatest(page).map(normalizeNovelCard);
        if (items.length > 0) next = String(page + 1);
    } else if (input === "watch_list") {
        items = getWatchList(page).map(normalizeSeriesCard);
        if (items.length > 0) next = String(page + 1);
    } else if (input === "bookmarks") {
        items = getBookmarks(page).map(normalizeNovelCard);
        if (items.length >= 24) next = String(page + 1);
    }

    return Response.success(items, next);
}
