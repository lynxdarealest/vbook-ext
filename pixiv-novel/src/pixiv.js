load("config.js");

var BASE_URL = PIXIV_CONFIG.BASE_URL || "https://www.pixiv.net";
var SERIES_PAGE_SIZE = 30;

function hasLogin() {
    return !!(PIXIV_CONFIG.PHPSESSID && String(PIXIV_CONFIG.PHPSESSID).trim());
}

function makeHeaders(referer) {
    var headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Referer": referer || BASE_URL
    };
    if (hasLogin()) {
        headers.Cookie = "PHPSESSID=" + String(PIXIV_CONFIG.PHPSESSID).trim();
    }
    return headers;
}

function fetchJson(url, referer) {
    var response = fetch(url, {
        headers: makeHeaders(referer)
    });
    if (!response.ok) {
        return null;
    }
    var data = response.json();
    if (!data || data.error) {
        return null;
    }
    return data.body || data;
}

function encodeValue(value) {
    return encodeURIComponent(value == null ? "" : String(value));
}

function pad2(value) {
    value = String(value);
    return value.length < 2 ? "0" + value : value;
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

function escapeHtml(text) {
    if (text == null) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function joinText(parts) {
    var filtered = [];
    for (var i = 0; i < parts.length; i++) {
        if (parts[i]) filtered.push(parts[i]);
    }
    return filtered.join(" • ");
}

function formatDate(value) {
    if (!value) return "";
    try {
        var date = new Date(value);
        return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
    } catch (error) {
        return String(value);
    }
}

function coverFromNovel(item) {
    if (!item) return "";
    if (item.url) return item.url;
    if (item.coverUrl) return item.coverUrl;
    if (item.cover && item.cover.urls) {
        return item.cover.urls["240mw"] || item.cover.urls["480mw"] || item.cover.urls.original || "";
    }
    return "";
}

function coverFromSeries(item) {
    if (!item) return "";
    if (item.url) return item.url;
    if (item.cover && item.cover.urls) {
        return item.cover.urls["240mw"] || item.cover.urls["480mw"] || item.cover.urls.original || "";
    }
    if (item.firstEpisode && item.firstEpisode.url) {
        return item.firstEpisode.url;
    }
    return "";
}

function normalizeNovelCard(item) {
    var description = stripHtml(item.description || "");
    var info = joinText([
        item.userName,
        item.seriesTitle,
        item.language,
        item.wordCount ? ("Words " + item.wordCount) : "",
        item.bookmarkCount ? ("Bookmarks " + item.bookmarkCount) : ""
    ]);
    return {
        name: item.title || "",
        link: BASE_URL + "/novel/show.php?id=" + item.id,
        cover: coverFromNovel(item),
        description: joinText([info, description])
    };
}

function normalizeSeriesCard(item) {
    var title = item.title || item.seriesTitle || "";
    var description = stripHtml(item.caption || item.description || "");
    var info = joinText([
        item.userName,
        item.language,
        item.displaySeriesContentCount ? ("Chapters " + item.displaySeriesContentCount) : "",
        item.watchCount ? ("Watchers " + item.watchCount) : ""
    ]);
    return {
        name: title,
        link: BASE_URL + "/novel/series/" + item.id,
        cover: coverFromSeries(item),
        description: joinText([info, description])
    };
}

function parseNovelId(url) {
    var match = /show\.php\?id=(\d+)/.exec(url || "");
    return match ? match[1] : "";
}

function parseSeriesId(url) {
    var match = /\/novel\/series\/(\d+)/.exec(url || "");
    return match ? match[1] : "";
}

function buildTagItem(tag) {
    return {
        title: tag,
        input: tag,
        script: "tag_search.js"
    };
}

function getCurrentUserId() {
    var body = fetchJson(BASE_URL + "/ajax/user/extra", BASE_URL + "/");
    if (!body) return "";
    return String(body.userId || body.user_id || (body.user && body.user.id) || "");
}

function getBookmarkTagNames(userId) {
    if (!userId) return [];
    var body = fetchJson(
        BASE_URL + "/ajax/user/" + userId + "/novels/bookmark/tags",
        BASE_URL + "/users/" + userId + "/bookmarks/novels"
    );
    if (!body) return [];
    var raw = body.public || body.tags || body;
    var list = [];
    if (!raw || !raw.forEach) return list;
    raw.forEach(function (entry) {
        var tag = entry && (entry.tag || entry.name || entry.value || entry);
        if (tag) list.push(String(tag));
    });
    return list;
}

function getTopTagNames() {
    var body = fetchJson(BASE_URL + "/ajax/top/novel?mode=all&lang=en", BASE_URL + "/");
    if (!body || !body.page || !body.page.tags) return [];
    var tags = [];
    body.page.tags.forEach(function (entry) {
        if (entry && entry.tag) tags.push(String(entry.tag));
    });
    return tags;
}

function getTopNovels() {
    var body = fetchJson(BASE_URL + "/ajax/top/novel?mode=all&lang=en", BASE_URL + "/");
    if (!body) return [];
    var novels = [];
    if (body.thumbnails && body.thumbnails.novel) {
        novels = body.thumbnails.novel;
    } else if (body.novels) {
        novels = body.novels;
    }
    var ids = [];
    if (body.page && body.page.recommend && body.page.recommend.ids) {
        ids = body.page.recommend.ids;
    } else if (body.recommend && body.recommend.ids) {
        ids = body.recommend.ids;
    }
    if (!ids.length) {
        return novels;
    }
    var idMap = {};
    ids.forEach(function (id) {
        idMap[String(id)] = true;
    });
    return novels.filter(function (item) {
        return idMap[String(item.id)];
    });
}

function getDiscoveryNovels() {
    var body = fetchJson(BASE_URL + "/ajax/novel/discovery?mode=all&lang=en", BASE_URL + "/");
    return body && body.novels ? body.novels : [];
}

function getSearchResult(keyword, page) {
    var encoded = encodeValue(keyword);
    var url = BASE_URL
        + "/ajax/search/novels/" + encoded
        + "?word=" + encoded
        + "&p=" + page
        + "&order=date_d"
        + "&mode=all"
        + "&s_mode=s_tag_full"
        + "&lang=en";
    var body = fetchJson(url, BASE_URL + "/tags/" + encoded + "/novels");
    if (!body || !body.novel) {
        return {
            items: [],
            next: null
        };
    }
    var items = body.novel.data || [];
    var currentPage = parseInt(page, 10) || 1;
    var next = null;
    if (body.novel.lastPage && currentPage < body.novel.lastPage) {
        next = String(currentPage + 1);
    } else if (items.length > 0 && !body.novel.lastPage) {
        next = String(currentPage + 1);
    }
    return {
        items: items,
        next: next
    };
}

function getNovelDetailById(novelId) {
    return fetchJson(BASE_URL + "/ajax/novel/" + novelId, BASE_URL + "/novel/show.php?id=" + novelId);
}

function getSeriesDetailById(seriesId) {
    return fetchJson(BASE_URL + "/ajax/novel/series/" + seriesId + "?lang=en", BASE_URL + "/novel/series/" + seriesId);
}

function getSeriesContentByOffset(seriesId, offset) {
    return fetchJson(
        BASE_URL + "/ajax/novel/series_content/" + seriesId + "?lang=en&limit=" + SERIES_PAGE_SIZE + "&offset=" + offset,
        BASE_URL + "/novel/series/" + seriesId
    );
}

function getFollowLatest(page) {
    var body = fetchJson(
        BASE_URL + "/ajax/follow_latest/novel?p=" + page + "&mode=all&lang=en",
        BASE_URL + "/"
    );
    return body && body.thumbnails && body.thumbnails.novel ? body.thumbnails.novel : [];
}

function getWatchList(page) {
    var body = fetchJson(
        BASE_URL + "/ajax/watch_list/novel?p=" + page + "&new=1&lang=en",
        BASE_URL + "/"
    );
    return body && body.thumbnails && body.thumbnails.novelSeries ? body.thumbnails.novelSeries : [];
}

function getBookmarks(page) {
    var userId = getCurrentUserId();
    if (!userId) return [];
    var offset = (page - 1) * 24;
    var url = BASE_URL
        + "/ajax/user/" + userId
        + "/novels/bookmarks?tag=&offset=" + offset
        + "&limit=24&rest=show&lang=en";
    var body = fetchJson(url, BASE_URL + "/users/" + userId + "/bookmarks/novels");
    if (!body) return [];
    return body.works || body.novels || [];
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
    tokens.forEach(function (entry) {
        text = text.replace(new RegExp(entry.key, "g"), entry.html);
    });
    return text;
}
