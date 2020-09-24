// Single record

// TODO: getLinksForDoc - prepare database

var bibtexVisible = false;

var documentKey = "";
var shortCite = "";
var doc_causal_links = [];

var contributor_usernames = [];

tableId = "links_table";
dtableConfig = {
		ordering: true,
        lengthChange: false,
        autoWidth: true,
        //fixedColumns: {leftColumns: 3},
        columns:[
        	{ data: 0, visible:false},  // pk
        	{ data: 1}, // v1
        	{ data: 2}, // relation
	       	{ data: 3}, // v2
   	       	{ data: 4}, //Cor,
		   	{ data: 5, visible:false}, //Subject,
		   	{ data: 6}, //Type,
		   	{ data: null, render: makeSampleInfo},
		   	{ data: 7, visible:false},//SampleN,
		   	{ data: 8, visible:false}, //SampleLocation,
		   	{ data: 9, visible:false}, //SampleDemographic,
		   	{ data: null, render:makeAnalysisInfo},
		   	{ data: 10, visible:false}, //AnalysisType,
		   	{ data: 11, visible:false}, //AnalysisDetails,
		   	{ data: 12}, //StatType,
		   	{ data: 13}, //Stat,
		   	{ data: 14}, //Confirmed,
		   	{ data: 15, render: makeNotesInfo} //Notes
        ]
    	
    };

function makeNotesInfo(data, type, row){
	if(type === 'display'){if(data!=null){
		 out = encodeURI(data).replace(/[']/g, escape);
		 var btn = '<button class="btn btn-primary" onclick=\"openQuote(\'' + 
										out + '\')\">Quote</button>';
		return(btn);
	}}
	return(data)
}

function makeSampleInfo(data, type, row){
	console.log(data);
	if(type === 'display'){if(data!=null){
	var out = "<b>N: </b>" + data[7] + "<br />" + 
			"<b>Location: </b>" + data[8] + "<br />" + 
			"<b>Demographic: </b>" + data[9] + "<br />";
	 // hide double quotes etc. and escape single quotes
	 out = encodeURI(out).replace(/[']/g, escape);
	 var btn = '<button class="btn btn-primary" onclick=\"openQuote(\'' + 
										out + '\',surroundWithQuotes=false)\">Sample</button>';
	 return(btn);
	 }}
	 return(data)
}

function makeAnalysisInfo(data, type, row){
	if(type === 'display'){if(data!=null){
	var out = "<b>Analysis Type: </b>" + data[10] + "<br />" + 
			"<b>Analysis Details: </b>" + data[11];
	 // hide double quotes etc. and escape single quotes
	 out = encodeURI(out).replace(/[']/g, escape);
	 var btn = '<button class="btn btn-primary" onclick=\"openQuote(\'' + 
										out + '\',surroundWithQuotes=false)\">Analysis</button>';
	 return(btn);
	 }}
	 return(data)
}

dtableConfig_otherDocsTable = {
		ordering: true,
        lengthChange: false,
        autoWidth: true,
    	columns: [
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		return '<a href="document.html?key=' + data[1] +'">'+data[0] + '</a>';
        	}},
        	{ data: null, render: function(data,type,row){
        		return '<a href="variable.html?key=' + data[3] +'">'+data[2] + '</a>';
        	}}
        	]
    };


var document_network_layout_options = {
	hierarchical: {
	    direction: "LR",
	    sortMethod: "directed",
	    levelSeparation: 250
		}
	};
var document_network_physics_options = {
	hierarchicalRepulsion : {
		nodeDistance: 50
	}};


function openQuote(text,surroundWithQuotes=true){
	text = decodeURI(text);
	if(surroundWithQuotes){
		if(!text.startsWith('"')){
			text = '"'+text;
		}
		if(!text.endsWith('"')){
			text += '"';
		}
	}
	$("#quoteDivText").html(text);
	$("#quoteDiv").show();
}

function closeQuote(){
	$("#quoteDivText").html("");
	$("#quoteDiv").hide();	
}

function updateRecord(response,type){
	console.log("updateRecord "+type);
	if(type=="bib"){
		response = JSON.parse(response);
		console.log(response[0].record);
		document.getElementById('bibtexsource').value = response[0].record;
		shortCite = response[0].citation;
		$("#documentShortCite").html(shortCite);
		displayBibtex();
	}
	if(type=="links"){
		doc_causal_links = JSON.parse(response);
		updateLinksTable(response); // should pass string 
		redrawGUIfromObject(JSON.parse(response)); //should pass object
	}
	if(type=="contributors"){
		response = JSON.parse(response);
		showContributors(response);
	}
	if(type=="connections"){
		if(response.length>5){
			updateLinksTable2(response,"other_docs_table",dtableConfig_otherDocsTable);
		} else{
			$("#connectionsToOtherDocs").hide();
		}
	}
}


function updateLinksTable2(text,tableIdX,dtableConfigX){

	var links = JSON.parse(text);
	// DataTable wants an array of arrays, so convert:
	var links2 = ObjectToArrayOfArrays(links);
	links2 = editData(links2);
	var dtableConfigX = $.extend({data:links2},dtableConfigX);
	
	var dtableX = $('#'+tableIdX).DataTable(dtableConfigX);
	
	// Add column searching
    dtableX.columns().every( function () {
        var that = this;
 		if(that.visible()){
	        $( 'input', this.footer() ).on( 'keyup change', function () {
	            if ( that.search() !== this.value ) {
	                that
	                    .search( this.value )
	                    .draw();
	            }
	        } );
    	}
    } );
    $('#'+tableIdX+' tfoot tr').appendTo('#'+tableIdX+' thead');
    document.getElementById(tableIdX+'_filter').style.display = "none";
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function revealBibtex(){
	bibtexVisible = !bibtexVisible;
	if(bibtexVisible){
		$("#bibtexsource").show();
	} else{
		$("#bibtexsource").hide();
	}
}

function openExplore(){
	var link_pks = "";
	for(var i=0;i<doc_causal_links.length;++i){
		link_pks += doc_causal_links[i].pk+",";
	}
	link_pks = link_pks.slice(0,link_pks.length -1);
	var url = "explore.html?links="+link_pks;
	window.open(url);
}

function openSource(){
	var documentYear = getYear();
	var decade = (Math.floor(documentYear/10)*10)+"s";
	var url = "https://github.com/CHIELDOnline/ARCUS/tree/master/data/tree/documents/" +
		decade + "/" + documentYear + "/" + documentKey;
	window.open(url);
}


function raiseIssue(){
	var title = encodeURIComponent("Question about "+shortCite);
	var docURL = "https://correlation-machine.com/ARCUS/document.html?key="+documentKey;
	var body = "Document: ["+documentKey+"]("+docURL+")\n";
	if(contributor_usernames.length>0){
		body += "Contributors: ";
		for(var i=0;i<contributor_usernames.length; ++i){
			if(contributor_usernames[i]!=null && 
				contributor_usernames[i].length>1 &&
				!contributor_usernames[i].startsWith("http")){
				body += "@"+contributor_usernames[i] + " "
			}
		}
		body += "\n";
	}
	body = encodeURIComponent(body);
	var url = "https://github.com/CHIELDOnline/ARCUS/issues/new?title="+title+"&body="+body+"&labels=data";
	window.open(url);
}

function openDiscussionHistory(){
	url = "https://github.com/CHIELDOnline/ARCUS/issues?q="+documentKey;
	window.open(url);
}

function showContributors(obj){
	console.log(obj);

	var t = "Contributed to ARCUS by: ";

	for(var i=0;i<obj.length;++i){
		if(obj[i].username!=null && obj[i].username.length>1){
			if(obj[i].username.startsWith('http')){
				t += '<a href="'+obj[i].username+'">'+obj[i].realname+"</a>";
			} else{
				contributor_usernames.push(obj[i].username);
				t += '<a href="https://github.com/'+obj[i].username+'">'+obj[i].realname+"</a>";
			}
		} else{
			t += obj[i].realname;
		}
		if(i<(obj.length-1)){
			t += "; ";
		}
	}
	console.log(t);
	$("#contributors").html(t);

}

function editDocumentData(){
	var url = "addData.html?document="+documentKey;
	window.open(url);
}

$(document).ready(function(){
	$("#quoteDiv").hide();
	$("#bibtexsource").hide();	
	$("#header").load("header.html", function(){
		$("#DocumentsHREF").addClass("active");
	}); 


	network_options.layout = document_network_layout_options;
	network_options.physics = document_network_physics_options;
	//network_options.edges.smooth = false;

    console.log(network_options);

	initialiseNetwork();
	network.on("click", network_on_click);

	documentKey = getUrlParameter('key');
	if(documentKey!=''){
		requestRecord("php/getDoc.php", "key="+documentKey,'bib');
		preparePage(tableId,"");
		requestRecord("php/getLinksForDoc.php", "key="+documentKey,'links');
		requestRecord("php/getContributorsForDoc.php", "key="+documentKey,'contributors');
		setupColumnSearching("other_docs_table");
		requestRecord("php/getConnectionsToDoc.php", "key="+documentKey,'connections');
	} else{
		// TODO: display no data message
		console.log("no data");
	}

	$( "#mynetwork" ).resizable();
});


function network_on_click (params){
	if(params["edges"].length ==1 && params["nodes"].length==0){
		var edgeId = params["edges"][0];
		for(var i=0; i < doc_causal_links.length;++i){
			if(doc_causal_links[i].pk == edgeId){
				var notes = doc_causal_links[i].Notes
				if(notes!=null && notes.length>0){
					openQuote(doc_causal_links[i].Notes);
				}else{
					closeQuote();
				}
				break;
			}
		} 
	} else{
			closeQuote();
		}
}