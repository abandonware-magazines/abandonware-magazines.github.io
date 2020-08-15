var baseFolderId = "0B7AcfXJGUxB7fnFTaUd4b0J5eUJ5LTZudTJ3OTNmbEVabHZwMTdpa1ROUWRGczFqSzZsUjQ";
var apiKey = 'AIzaSyAtk7heHp6Vlm7QiivgRjz1Te2viYCXtVc';
var debugEnabled = false;

var QueryString = function () {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    } 
    return query_string;
} ();	

function isNormalInteger(str) {
    return /^[1-9]\d*$/.test(str);
}

function isAlphaNumeric(str) {
    var isNotAN = /[^a-zA-Z0-9]+/.test(str);
    return !isNotAN;
}

function zeroFill( number, width )
{
    width -= number.toString().length;
    if ( width > 0 )
    {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
    }
    return number + ""; // always return a string
}

function ShowImages()
{
    if (QueryString.m && QueryString.n && QueryString.pagenumbers)
    {
        var MagName = QueryString.m;
        var MagNum = QueryString.n;
        var pageNumArr = QueryString.pagenumbers.split(",");
        if (pageNumArr.length == 0)
        {
            return;
        }
        
        if (!isAlphaNumeric(MagName))
        {
            return;
        }
        
        if (/^[0-9]+$/.test(MagNum) == false)
        {
            return;
        }
        
        MagNum = zeroFill(MagNum, 3);
        
        var imageInfo = {
            magazineName: MagName,
            magazineNumber: MagNum,
            pageNumbers: $.map( pageNumArr, function( x, i ) {
                if (isNormalInteger(x))
                {
                    return ( zeroFill(x, 2) + ".jpg" );
                }
                else
                {
                    return null;
                }
            })
        };
        
        try 
        {
            phase1_locateMagazineFolder(baseFolderId, imageInfo);
        }
        catch (err) 
        {
            debugLog(err);
        } 
        
        
    }
};

function debugLog(m)
{
    if (console && console.log && debugEnabled)
    {
        console.log(m);
    }
}


function childFolderIdFromParentFolderId(parentFolderId, nameArr, callback, userarg)
{
    var request = gapi.client.drive.files.list({
        'q'       : "'" + parentFolderId + "' in parents",
        'fields'  : "files(id,name,webContentLink,webViewLink)",
        'pageSize': 200,
        'orderBy' : "name"
    });
    request.execute(function(resp) 
    {
        debugLog(resp);
        var childIds = [];
        if (resp && resp.files && Array.isArray(resp.files) && resp.files.length > 0)
        {
            $.each(resp.files, function() 
            {
                var that = this
                if ($.inArray(that.name, nameArr) > -1)
                {
                    childIds.push(that);
                }
            });
        }
        
        debugLog(childIds);
        if (childIds.length == 0)
        {
            throw "Error: Could not find requested child!";
        }
        
        callback(childIds, userarg);
    });
}

function phase4_displayImages(images, imageInfo)
{
    debugLog("In displayImages()");
    $.each(images, function(index, image){
        if (image.webContentLink)
        {
            $("#iviewer_wrapper").append('<div class="viewer" id="image' + index + '"></div>');
            $("#image" + index).iviewer({
                src: image.webContentLink,
                update_on_resize: false,
                zoom_animation: false,
                mousewheel: false,
                onMouseMove: function(ev, coords) { },
                onStartDrag: function(ev, coords) { return true; }, 
                onDrag: function(ev, coords) { },
                zoom_min: 5
            });
        }
    });
}

function phase3_locateImages(issueFolders, imageInfo)
{
    debugLog("In locateImages()");
    if (issueFolders && issueFolders.length > 0 && issueFolders[0].id)
    {
        childFolderIdFromParentFolderId(issueFolders[0].id, imageInfo.pageNumbers, phase4_displayImages, imageInfo);
    }
}

function phase2_locateIssueFolder(magazineFolders, imageInfo)
{
    debugLog("In locateIssueFolder()");
    if (magazineFolders && magazineFolders.length > 0 && magazineFolders[0].id)
    {
        childFolderIdFromParentFolderId(magazineFolders[0].id, [imageInfo.magazineNumber], phase3_locateImages, imageInfo);
    }
};

function phase1_locateMagazineFolder(baseFolderId, imageInfo)
{
    debugLog("In locateMagazineFolder()");
    childFolderIdFromParentFolderId(baseFolderId, [imageInfo.magazineName], phase2_locateIssueFolder, imageInfo);
};

function loadGAPI()
{
    gapi.client.setApiKey(apiKey);
    gapi.client.load('drive', 'v3', ShowImages);
}

//https://developers.google.com/apis-explorer/?hl=en_GB#p/drive/v3/drive.files.get
//https://developers.google.com/apis-explorer/?hl=en_GB#p/drive/v3/drive.files.list