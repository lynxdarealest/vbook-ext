function execute(url) {
    if (!url) {
        return Response.error("Invalid URL");
    }

    var match = url.match(/series\/(\d+)/);

    if (!match) {
        return Response.error("Cannot detect series id");
    }

    var seriesId = match[1];

    function getAllSeriesContents(seriesId) {
        var all = [];
        var offset = 0;

        while (true) {
            var body = getSeriesContentByOffset(seriesId, offset);

            if (!body) {
                break;
            }

            var items =
                body.seriesContents ||
                (body.thumbnails && body.thumbnails.novel) ||
                [];

            if (!items.length) {
                break;
            }

            all = all.concat(items);

            if (items.length < SERIES_PAGE_SIZE) {
                break;
            }

            offset += SERIES_PAGE_SIZE;
        }

        return all;
    }

    var seriesItems = getAllSeriesContents(seriesId);

    return Response.success(
        seriesItems.map(function (item) {
            return {
                name: item.title || "",
                url: BASE_URL + "/novel/show.php?id=" + item.id
            };
        })
    );
}
