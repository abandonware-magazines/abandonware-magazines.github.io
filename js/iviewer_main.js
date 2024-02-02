const baseFolderId = "0B7AcfXJGUxB7fnFTaUd4b0J5eUJ5LTZudTJ3OTNmbEVabHZwMTdpa1ROUWRGczFqSzZsUjQ";
const apiKey = 'AIzaSyAtk7heHp6Vlm7QiivgRjz1Te2viYCXtVc';
const debugEnabled = false;

const QueryString = function () {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    const query_string = {};
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i=0; i<vars.length; i++) {
        let pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            let arr = [ query_string[pair[0]], pair[1] ];
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
    const isNotAN = /[^a-zA-Z0-9]+/.test(str);
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

async function ShowImages()
{
    try
    {
        if (!QueryString.m || !QueryString.n || !QueryString.pagenumbers)
        {
            throw "Error: Query string missing!";
        }

        const MagName = QueryString.m;
        let MagNum = QueryString.n;
        const pageNumArr = QueryString.pagenumbers.split(",");

        if (MagName.toLowerCase() in magazine_name_mapping)
        {
            const h1 = $("h1:first");
            h1.html(h1.html() + " " + magazine_name_mapping[MagName.toLowerCase()])
        }

        if (pageNumArr.length == 0)
        {
            throw "Error: Page array empty!";
        }
        
        if (!isAlphaNumeric(MagName))
        {
            throw "Error: Magazine name not alphanumeric!";
        }
        
        if (/^[0-9]+$/.test(MagNum) == false)
        {
            throw "Error: Magazine number not numeric!";
        }
        
        MagNum = zeroFill(MagNum, 3);
        
        const imageInfo = {
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

        const magazineFolders = await childFolderIdFromParentFolderId(baseFolderId, [imageInfo.magazineName]);
        if ( (!magazineFolders) || (magazineFolders.length <= 0) || (!magazineFolders[0].id) )
        {
            throw "Error: Invalid magazineFolders!";
        }

        const issueFolders = await childFolderIdFromParentFolderId(magazineFolders[0].id, [imageInfo.magazineNumber]);
        if ( (!issueFolders) || (issueFolders.length <= 0) || (!issueFolders[0].id))
        {
            throw "Error: Invalid issueFolders!";
        }

        const images = await childFolderIdFromParentFolderId(issueFolders[0].id, imageInfo.pageNumbers);
        $.each(images, function(index, image){
            if (image.webContentLink)
            {
                $("#iviewer_wrapper").append('<div class="iviewer_viewer" id="iviewer_image' + index + '"></div>');
                $("#iviewer_image" + index).iviewer({
                    src: "https://lh3.googleusercontent.com/d/" + image.id,
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
    catch (err) 
    {
        $("#iviewer_wrapper").html('<p class="text-danger">אירעה שגיאה!</p>')
        debugLog(err);
    }   
};

function debugLog(m)
{
    if (console && console.log && debugEnabled)
    {
        console.log(m);
    }
}


async function childFolderIdFromParentFolderId(parentFolderId, nameArr)
{
    const response = await gapi.client.drive.files.list({
        'q'       : "'" + parentFolderId + "' in parents",
        'fields'  : "files(id,name,webContentLink,webViewLink)",
        'pageSize': 200,
        'orderBy' : "name"
    });

    debugLog(response);
    const childIds = [];
    //if (response && response.result && response.result.files && Array.isArray(response.result.files) && response.result.files.length > 0)
    if (Array.isArray(response?.result?.files))
    {
        $.each(response.result.files, function() 
        {
            const that = this
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

    return childIds;
}

function loadGAPI()
{
    gapi.client.setApiKey(apiKey);
    gapi.client.load('drive', 'v3', ShowImages);
}

//https://developers.google.com/apis-explorer/?hl=en_GB#p/drive/v3/drive.files.get
//https://developers.google.com/apis-explorer/?hl=en_GB#p/drive/v3/drive.files.list
//https://stackoverflow.com/questions/77831632
