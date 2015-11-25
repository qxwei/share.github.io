var ShareTip = function () {
};
//分享到腾讯微博  
ShareTip.prototype.sharetoqq = function (title, url, picurl)
{
    var shareqqstring = 'http://v.t.qq.com/share/share.php?title=' + title + '&url=' + url + '&pic=' + picurl;
    openNewTab(shareqqstring);
};
//分享到新浪微博  
ShareTip.prototype.sharetosina = function (title, url, picurl)
{
    var sharesinastring = 'http://v.t.sina.com.cn/share/share.php?title=' + title + '&url=' + url + '&content=utf-8&sourceUrl=' + url + '&pic=' + picurl;
    openNewTab(sharesinastring);
};
//分享到QQ空间  
ShareTip.prototype.sharetoqqzone = function (url, title, summary, desc, picurl)
{
    var shareqqzonestring = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + url + '&title=' + title + '&desc=' + desc + '&summary=' + summary + '&pics=' + picurl;
    openNewTab(shareqqzonestring);
};
function openNewTab(url)
{
    var a = $("<a href='" + url + "' target='_blank'></a>").get(0);
    var e = document.createEvent('MouseEvents');
    e.initEvent('click', true, true);
    a.dispatchEvent(e);
    return;
}
function share(url,title, summary, desc, picurl, type) {
    title = encodeURIComponent(title);
    var share1 = new ShareTip();
    if (type === 'qqzone')
    {
        summary = encodeURIComponent(summary);
        share1.sharetoqqzone(url, title, summary, desc, picurl);
    }
    else if (type === 'sina')
    {
        summary = encodeURIComponent(summary.substring(0, 200));
        share1.sharetosina(title+'  '+summary, url, picurl);
    }
    else if (type === 'qq')
    {
        summary = encodeURIComponent(summary.substring(0, 200));
        share1.sharetoqq('<<'+title+'>>'+summary, url, picurl);
    }
}
;