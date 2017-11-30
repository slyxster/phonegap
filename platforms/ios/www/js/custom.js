var loadingComplete = 0;
var insecticideCount = 0;

function populateDropdown(data) {

	var ctr = 0;
    	var numRecords = data.length;
    
	$(data).each(function() {

		var id = $(this)[0]['id'];
		var cropNameArr = $(this)[0]['acf']['crop_name'];
        	var name = $(this)[0]['acf']['insecticide_name']; 

        	if ($.isArray(cropNameArr)) {
            		var cropName = cropNameArr[0];
        	} else { 
            		var cropName = cropNameArr;
        	}

		if (cropName) { 
			var cropclass = cropName.replace(/\s+/g, '');
		} else {
			var cropclass = "";
		}
                
		var restrictedUse = $(this)[0]['acf']['restricted_use'];
		var restrictedInterval = $(this)[0]['acf']['restricted_entry_interval'];

        if (cropName) {
		  if (Crops.indexOf(cropName) < 0) { 
			Crops.push(cropName);
              
			// Populate Crop list
                	var item = '<option data-crop="'+cropclass+'" value="'+ctr+ '">'+cropName+'</option>';
                        $('.crop').append(item);

			ctr++;
		  }
        }

			// Populate Insect List
			// Populate Insecticide list
			var insecticides = $(this)[0]['acf']['insecticide_performance_rating'];
        
			$(insecticides).each(function(i) {
                                
				var insectName = $(this)[0]['insect_name'];                 
				var insectclass = insectName.replace(/\s+/g, '');

				if (Insects.indexOf(insectName+cropclass) < 0) { 
					Insects.push(insectName+cropclass);
                        var itemI = '<option class="'+cropclass+'" data-insect="'+insectclass+'" value="'+insectName+ '">'+insectName+'</option>';
                        $('.insectoptions').append(itemI);
				}

				var rate = $(this)[0]['rate'];
				var rating = $(this)[0]['rating_number'];
				var threshold = $(this)[0]['threshold'];
                var comments = $(this)[0]['comment'];
					Thresholds[id+"_"+i] = threshold;
				var image = $(this)[0]['insect_photo']['url'];
                                                
                var itemC = '<option class="'+cropclass+'" data-image="'+image+'" data-restricted="'+restrictedUse+'" data-interval="'+restrictedInterval+'" data-rate="'+rate+'" data-rating="'+rating+'" data-comment="'+comments+'" data-insect="'+insectclass+'" value="'+id+"_"+i+ '">'+name+'</option>';
                                
                insecticideCount++;
                $('.insecticides').append(itemC);
				
			});

	});
    
        loadingComplete = loadingComplete + 1;
        //$(".status").html(" Loading " + numRecords + " records. " + loadingComplete);
    
        //if (loadingComplete > 2) {
                    $(".status").html(" Ready to Use ");
                    //$(".selection").show();
        //}
        
}

var Crops = [];
var Insects = [];
var Thresholds = [];

function getBase64FromImageUrl(url) {
    var img = document.getElementById('picholder');
    var canvas = document.getElementById("imageCanvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 10, 10);
        var dataURL = canvas.toDataURL("image/jpg");
        var saveUrl = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function convertImgToDataURL(image) {
            var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var img = new Image();
                img.crossOrigin = "Anonymous";

            img.onload = function() {
                    canvas.height = this.height;
                    canvas.width = this.width;
                    ctx.drawImage(this, 0, 0);
                    var dataURL;

                    dataURL = canvas.toDataURL();
                    canvas = null;
                        window.localStorage.setItem(image, dataURL);
            };

            img.src = image;
}

function getData(){
    // oData sample API
    loadingComplete = 0;
    var recordCount = 225;

    //$(".selection").hide();
   
    while (recordCount < 250) {        
        if (recordCount == 225) {
            var iUrl = "http://www.mississippi-crops.com/wp-json/acf/v3/insecticides?per_page=225";
            queryServer(iUrl, recordCount);
        } else {
            var nextSet = "http://www.mississippi-crops.com/wp-json/acf/v3/insecticides?per_page=225&filter[offset]="+recordCount;
            queryServer(nextSet, recordCount);
        }
        recordCount = recordCount + 225;
    }
}   

function queryServer(url, id) {
    
    var netStatus = navigator.onLine ? 'online' : 'offline';
    
    if (netStatus == "offline") {
            offlineCount = 50;
            while (offlineCount < 250) {
                populateDropdown(JSON.parse(window.localStorage.getItem("bugdata"+offlineCount)));
                offlineCount = offlineCount + 50;
            }
    } else {
        
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() {
            if(req.readyState == 4){
                if (req.status == 200) {
                    if (typeof(Storage) !== "undefined") {
                        //window.localStorage.setItem("bugdata"+id, req.responseText);
                        populateDropdown(JSON.parse(req.responseText));
                    } else {
                        populateDropdown(JSON.parse(req.responseText));
                    }
                }
            }
        };
        req.timeout = 30000;
        req.open('GET', url, true);
        req.send();   
    }
}
        
//------------------------------------------------------------------------------------------------------------------

$('#crops a').click(function() {
    var pageId = $(this).data('id');
    var url = "http://www.mississippi-crops.com/api/get_page/?id="+pageId;

    $.getJSON(url, function(data){
       $("#pagecontent div.innercontent").html(data.page.content);
        return false;
    });
    
});

$('a').click(function() {
    $('div.panel').removeClass('active');
});


var currentIdx = 0;
var crop = "";

	$("body").on("change", ".crop", function() {
		crop = $("body .crop").find(':selected').data('crop');
        
         	$('.insect option').each(function() {
                        if ($(this).hasClass('default')) { } else { $(this).remove(); }
                });
        
        	$('.insecticide option').each(function() {
                        if ($(this).hasClass('default')) { } else { $(this).remove(); }
                });

                $('.insectoptions option').each(function() {
                        var addoption = $(this);

                        if ($(addoption).hasClass(crop)) {
                                $('select.insect').append($(addoption).clone());

                        }
                });

                $('.insect .default').show();
	});

	$("body").on("change", ".insect", function() {
                
		var insect = $("body .insect").find(':selected').data('insect');
        
        // Clear out fields
        $(".imageholder").html('');
        $(".result div.rate span").html('');
        $(".result h1").html('0');
        $(".result div.use span").html("");	
        $(".result div.interval span").html('');	
		$(".result div.threshold p").html('');
        $(".result div.comment p").html('');

            $('.insecticide option').each(function() {
                        if ($(this).hasClass('default')) { } else { $(this).remove(); }
                });

		$(".insecticides option").each(function() {
			var ii = $(this).data('insect');
            var cropclass = $(this).attr("class");
			if (ii) {
				if (ii == insect) { 
                    if (crop == cropclass) {
                        $('select.insecticide').append($(this).clone());
                    }
                }
			}
		});
        });

	$("body").on("change", ".insecticide", function() {
		var thresholdId = $("body .insecticide").find(':selected').val(); 
		var interval = $("body .insecticide").find(':selected').data('interval');
		var rating = $("body .insecticide").find(':selected').data('rating');
        	var rate = $("body .insecticide").find(':selected').data('rate');
        	var comment = $("body .insecticide").find(':selected').data('comment');
		var restricted = $("body .insecticide").find(':selected').data('restricted');
		var threshold = Thresholds[thresholdId];
		var image = $("body .insecticide").find(':selected').data('image');
         
            $(".imageholder").html('');

		if (image) {
            var imageSrc = 
                bugimage = '<img src="'+image+'" border="0" />';
			$(".imageholder").append(bugimage);
        } else {
            $(".imageholder").html('No Image <br/> Found ');
        }
	
        $(".result div.rate span").html(rate);
		$(".result h1").html(rating);	
		if (restricted) { 
			$(".result div.use span").html("Yes");	
		} else {
			$(".result div.use span").html("No");	
		}

		$(".result div.interval span").html(interval);	
		$(".result div.threshold p").html(threshold);
        		$(".result div.comment p").html(comment);

	});
