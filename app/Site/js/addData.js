// TODO: make sure bibref has no illegal characters
// TODO: check that JSONtoCSV actually works with escaping quotes

var submissionFinished = false;

var characterLengthLimit = 7800;

var existingVariables = [];
var tmpVariables = []; // loaded from cookie

var existingDocuments = [];
var editingExistingData = false;

var relationTypes = [
	{ Name: "", Id: "" },
	{ Name: ">", Id: ">" },
	{ Name: "<=>", Id: "<=>" },
	{ Name: "~=", Id: "~=" },
	{ Name: ">>", Id: ">>" },
	{ Name: "/>", Id: "/>"},
	{ Name: "~", Id: "~"},
	{ Name: "^", Id: "^"}
];

var correlationTypes = [
	{ Name: "", Id: ""},
	{ Name: "pos", Id: "pos"},
	{ Name: "neg", Id: "neg"},
	{ Name: "n-m", Id: "n-m"},
];

var studyTypeTypes = [
	{ Name: "", Id: ""},
	{ Name: "experiment", Id: "experiment"},
	{ Name: "review", Id: "review"},
	{ Name: "model", Id: "model"},
	{ Name: "simulation", Id: "simulation"},
	{ Name: "statistical", Id: "statistical"},
	{ Name: "survey", Id: "survey"},
	{ Name: "qualitative", Id: "qualitative"},
	{ Name: "logical", Id: "logical"},
	{ Name: "hypothesis", Id: "hypothesis"},
	{ Name: "other", Id: "other"}
	];

var confirmTypes = [
	{Name: "", Id: "none"},
	{Name:"yes", Id: "yes"},
	{Name:"no", Id: "no"}
];

/* Attempt to add tooltips to jsgrid
tooltipHeaders = {
	Var1: "First variable",
	Relation: "Type of relation between variables",
	Var2: "Second variable",
	Cor: "Direction of correlation",
	Topic: "Research topic",
	Stage: "Evolution stage",
	Type: "Type of study (experiment, model ...)",
	Confirmed: "Did the study confirm the hypothesis?",
	Notes: "Quotes from the paper"
}

function headerTooltip(){ 
	console.log(this.name);
	console.log(tooltipHeaders[this.name]);
	return $("<div>").prop("title", tooltipHeaders[this.name]).text(this.title); 
}
// Then add "headerTemplate: headerTooltip" to dataHeaders property
*/

function escapeHTML (s, noEscapeQuotes) {
        var map = { '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'};
            return s.replace(noEscapeQuotes ? /[&<>]/g : /[&<>'"]/g, function(c) {
                return map[c];
            });
    }
var escapeCell = function(value, item){
    return $("<td>").append(escapeHTML(value));
}
var sampleCell = function(value, item){
	console.log("ITEM");
	console.log(item);
	var out = "";
	if((value.length >0) || (item.SampleLocation.length>0) || (item.SampleDemographic.length>0)){
		out = value + ";" + item.SampleLocation + ";" + item.SampleDemographic;
	}
    return $("<td>").append(escapeHTML(out));
}
var analysisCell = function(value, item){
	var out = "";
	if((value.length >0) || (item.AnalysisDetails.length>0)){
		out = value + ": " + item.AnalysisDetails;
	}
    return $("<td>").append(escapeHTML(out));
}



customEditRowRenderer = function(item, itemIndex) {
    var grid = this;
    var headers = grid._headerRow[0].children;
    var headerWidths = []
    for(var i=0;i<headers.length;++i){
    	headerWidths.push($(headers[i]).outerWidth());
    }
    
    var fields = ["Var1","Relation","Var2","Cor","Subject","Type","Sample","Analysis","Stat type","Stat","Confirmed","Notes"];
    
    var $Var1 = $('<input>').attr("type", "text").attr("name", "Var1").val(item.Var1).css({width:"100%",padding: ".3em .5em;"});
    var $Relation = makeSelector(relationTypes).attr("name", "Relation").val(item.Relation).css({width:"100%",padding: ".3em .5em;"});
    var $Var2 = $('<input>').attr("type", "text").attr("name", "Var2").val(item.Var2).css({width:"100%",padding: ".3em .5em;"});
    var $Cor = makeSelector(correlationTypes).attr("name", "Cor").val(item.Cor).css({width:"100%",padding: ".3em .5em;"});
    var $Subject = $('<input>').attr("type", "text").attr("name", "Subject").val(item.Subject).css({width:"100%",padding: ".3em .5em;"});
    var $Type = makeSelector(studyTypeTypes).attr("name", "Type").val(item.Type).css({width:"100%",padding: ".3em .5em;"});
    var $Sample = $('<button>Edit</button>').click(showSampleEditor).css({width:"100%",padding: ".3em .5em;"});
    	$("#SampleN").val(item.Sample);
    	$("#SampleLocation").val(item.SampleLocation);
    	$("#SampleDemographic").val(item.SampleDemographic);
    var $Analysis = $('<button>Edit</button>').click(showAnalysisEditor).css({width:"100%",padding: ".3em .5em;"});
    	$("#AnalysisType").val(item.Analysis);
    	$("#AnalysisDetails").val(item.AnalysisDetails);
    var $StatType = $('<input>').attr("type", "text").attr("name", "StatType").val(item["Stat type"]).css({width:"100%",padding: ".3em .5em;"});    
    var $Stat = $('<input>').attr("type", "text").attr("name", "Stat").val(item.Stat).css({width:"100%",padding: ".3em .5em;"});    
    var $Confirmed = makeSelector(confirmTypes).attr("name", "Confirmed").val(item.Confirmed).css({width:"100%",padding: ".3em .5em;"});
    var $Notes = $('<input>').attr("type", "text").attr("name", "Notes").val(item.Var1).css({width:"100%",padding: ".3em .5em;"});
    

    var $updateButton = $("<input>").attr("type", "button").addClass("jsgrid-button jsgrid-update-button").height("100%");
    var $cancelButton = $("<input>").attr("type", "button").addClass("jsgrid-button jsgrid-cancel-button").height("100%");

    $updateButton.on("click", function() {
      grid.updateItem(item, {
        Var1: $Var1.val(),
        Relation: $Relation.val(),
        Var2: $Var2.val(),
        Cor: $Cor.val(),
        Subject: $Subject.val(),
        Type: $Type.val(),
        Sample: $("#SampleN").val(),
        SampleLocation: $("#SampleLocation").val(),
        SampleDemographic: $("#SampleDemographic").val(),
        Analysis: $("#AnalysisType").val(),
        AnalysisDetails: $("#AnalysisDetails").val(),
        StatType: $StatType.val(),
        Stat: $Stat.val(),
        Confirmed: $Confirmed.val(),
        Notes: $Notes.val()
      });
    });

    $cancelButton.on("click", function() {
      grid.cancelEdit();
    });
    
	$("#ESampleEditorApply").click(function(){
		// This is handled by the updateButton, so just close editor
		$("#sampleEditor").blur();
		$("#sampleEditor").hide();
	});
	
	$("#EAnalysisEditorApply").click(function(){
		// This is handled by the updateButton, so just close editor
		$("#analysisEditor").blur();
		$("#analysisEditor").hide();
	})
	
	// Problem: This works, but overwrites any information in 
	//  other columns that are being edited.
	$("#ESampleEditorApplyAll").hide(); // hide until we can fix this
	$("#ESampleEditorApplyAll").click(function(){

		// Update current editing item, so that changes are not lost
		// This currently doesn't fix the problem
		grid.updateItem({
			Var1: $Var1.val(),
			Relation: $Relation.val(),
			Var2: $Var2.val(),
			Cor: $Cor.val(),
			Subject: $Subject.val(),
			Type: $Type.val(),
			Sample: $("#SampleN").val(),
			SampleLocation: $("#SampleLocation").val(),
			SampleDemographic: $("#SampleDemographic").val(),
			Analysis: $("#AnalysisType").val(),
			AnalysisDetails: $("#AnalysisDetails").val(),
			StatType: $StatType.val(),
			Stat: $Stat.val(),
			Confirmed: $Confirmed.val(),
			Notes: $Notes.val()
      	});
		
		var update = {Sample: $("#SampleN").val(),
						SampleLocation: $("#SampleLocation").val(),
						SampleDemographic: $("#SampleDemographic").val()};
	
		var items = $("#jsGrid").jsGrid("option", "data");
		for (var i = 0; i < items.length; ++i) {
			$("#jsGrid").jsGrid("updateItem", items[i], update);
			//grid.updateItem(items[i],update);
		}

		$("#sampleEditor").blur();
		$("#sampleEditor").hide();
		grid.refresh();
	});
	
	$("#ESampleEditorCancel").click(function(){
		$("#sampleEditor").blur();
		$("#sampleEditor").hide();
	});
	
	$("#EAnalysisEditorCancel").click(function(){
		$("#analysisEditor").blur();
		$("#analysisEditor").hide();
	});
	

    return $('<tr>')
      .append($('<td>').addClass("jsgrid-cell").width(headerWidths[0]).append($Var1))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[1]).append($Relation))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[2]).append($Var2))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[3]).append($Cor))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[4]).append($Subject))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[5]).append($Type))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[6]).append($Sample))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[9]).append($Analysis))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[11]).append($StatType))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[12]).append($Stat))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[13]).append($Confirmed))
     .append($("<td>").addClass("jsgrid-cell").width(headerWidths[14]).append($Notes))
      
      .append($updateButton)
      .append($cancelButton);
  }
  
function makeSelector(options){
	var $el = $("<select>").width("100%");
	$el.empty(); // remove old options
	for(var i=0;i<options.length;++i){
	    $('<option />', {value: options[i].Name, text: options[i].Id}).appendTo($el);
	}
	return($el)
}


showSampleEditor = function(){
	$("#sampleEditor").show();
	
}

showAnalysisEditor = function(){
	$("#analysisEditor").show();
}




// Add validator for variable names
variableIsLowercaseAndNotBlank = function(value, item) {
        return /^([^A-Z])/.test(value) && value.length >0;
    }
variableHasTrailingOrLeadingWhitespace = function(value, item) {
        return value == value.trim();
    }
jsGrid.validators.lowercase = {
    message: "Variable names cannot be blank and should not be capitalised.",
    validator: variableIsLowercaseAndNotBlank
};
jsGrid.validators.noWhitespace = {
    message: "Variable names should not have leading or trailing whitespace.",
    validator: variableHasTrailingOrLeadingWhitespace
};


var dataHeaders = [
            { name: "Var1", type: "text", width: 150, 
            	// Add autosuggest
		        insertTemplate: function(value) { 
		        	return this._insertAuto = $("<input>").autocomplete({ 
		        		source: filterWithMaxLengthLimit});}, 
		        insertValue: function() { return this._insertAuto.val(); },
		    	cellRenderer: escapeCell,
		    	validate: ["lowercase","noWhitespace"]
		    },
            { name: "Relation", type: "select", items: relationTypes, valueField: "Id", textField: "Name" },
            { name: "Var2", type: "text", width: 150,
            	// Add autosuggest
        		insertTemplate: function(value) { 
		        	return this._insertAuto = $("<input>").autocomplete({ 
		        		source: filterWithMaxLengthLimit});}, 
		        insertValue: function() { return this._insertAuto.val(); },
		    	cellRenderer: escapeCell,
		    	validate: ["lowercase","noWhitespace"]
		    },
            { name: "Cor", type: "select", items: correlationTypes, valueField: "Id", textField: "Name" },
            { name: "Subject", type: "text", width: 150,cellRenderer: escapeCell },
			{ name: "Type", type: "select", items: studyTypeTypes, valueField: "Id", textField: "Name", width: 150 },
			{ name: "Sample", type: "text", width: 50, cellRenderer: sampleCell },
			{ name: "SampleLocation", type: "text", width: 0, css:"hiddenColumn" },
			{ name: "SampleDemographic", type: "text", width: 0, css:"hiddenColumn" },
			{ name: "Analysis", type: "text", width: 50, cellRenderer: analysisCell },
			{ name: "AnalysisDetails", type: "text", width: 0, css:"hiddenColumn" },
			{ name: "Stat type", type: "text"},
			{ name: "Stat", type: "text"},
			{ name: "Confirmed", type: "select", items: confirmTypes, valueField: "Id", textField: "Name" },
			{ name: "Notes", type: "text", width: 150, cellRenderer: escapeCell },
            { type: "control" }
        ];



var bib_year = "";
var bib_key = "";
var bib_source = "";
var bib_title = "";

var contributor = "";
var contributor_realName = "";

var CHIELDVersion = "";


function showTab(id){
	$('.nav-tabs a[href="#'+id+'"]').tab('show');
	hideAlerts();
}

function hideAlerts(){
	$("#ContributorAlert").hide();
	$("#ReferenceAlert").hide();
	$("#ReferenceYearAlert").hide();
	$("#ReferenceTitleAlert").hide();
	$("#ReferenceKeyAlert").hide();
	$("#ReferenceKeyAlert2").hide();
	$("#CausalLinksAlert").hide();
	$("#BlankVariableAlert").hide();
}


function validateSubmission(){
	hideAlerts();
	var valid = true;
	// Check contributor
	if(contributor ==""){
		$("#ContributorAlert").show();
		valid = false;
	}
	// Check bib
	if(!updateBib()){ // also updates bib
		$("#ReferenceAlert").show();
		valid = false;
	} else{
		// check if there's an entry for year
		if(bib_year===undefined){
			$("#ReferenceYearAlert").show();
			valid = false;
		} else{
			// check if the year is a number
			if(bib_year.length!=4 || isNaN(bib_year)){
				$("#ReferenceYearAlert").show();
				valid = false;
			}
		}

		if(bib_title===undefined){
			$("#ReferenceTitleAlert").show();
			valid = false;
		}

		if(bib_key.search("/")>=0){
			$("#ReferenceKeyAlert").show();
			valid = false;
		}

		// Check bib key is acceptable
		if(!(/^[A-Za-z0-9_-]+$/.test(bib_key))) {
			$("#ReferenceKeyAlert2").show();
			valid = false;
		}

	}
	// Check causal links
	if($("#jsGrid").data().JSGrid.data.length==0){
		$("#CausalLinksAlert").show();
		valid = false;
	}
	if(linksHasBlankVariableName()){
		$("#BlankVariableAlert").show();
		valid = false;
	}

	return(valid);
}

function linksHasBlankVariableName(){
	var d = $("#jsGrid").data().JSGrid.data;
	for(var i=0;i<d.length;++i){
		if(d[i].Var1=="" || d[i].Var2==""){
			return(true);
		}
	}
	return(false);
}

function updateBib(){
	console.log("change");
	$("#submissionResults").html("");
	displayBibtex();
	var bib = document.getElementById("bibtexsource").value;
	var bib_object = bibtex2JSON(bib);	
	if(bib_object=="Cannot parse bibtex file"){
		document.getElementById("bibtexhtml").innerHTML = "Cannot parse bibtex file";
		bib_year = "";
		bib_key = "";
		bib_source = "";
		bib_title = "";
		return(false);
	} else{
		bib_year = bib_object[0].properties.year;
		bib_key = bib_object[0].label;
		bib_source = bib;
		bib_title = bib_object[0].properties.title;
		checkForDuplicatePublication();
		bib2GeneralNotes(bib_object[0].properties.note);
		return(true);
	}
}

function simplifyTitle(title){
	if(title){
		title = title.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
		title = title.replace(/\s{2,}/g," ");
		title = title.trim();
		title = title.toLowerCase();
	}
	return(title);
}

function checkForDuplicatePublication(){

	if(editingExistingData){
		return(true); // contributor is explicitly editing an existing document
	}

	var currentTitle = simplifyTitle(bib_title);

	for(var i=0;i<existingDocuments.length;++i){
		if(existingDocuments[i].title == currentTitle){
			alert("Warning: There is already a document in the database with that title ("+currentTitle+").");
			return(true);
		}
		if(existingDocuments[i].pk == bib_key){
			alert("Warning: There is already a document in the database with that bibtex key ("+bib_key+").");
			return(true);
		}
	}
	return(false);
}

function bib2GeneralNotes(text){
	if(typeof text !== "undefined"){
		$("#generalNote").val(text);
	} else{
		$("#generalNote").val("");
	}
}

function generalNotes2Bib(){
	var txt = $("#generalNote").val();
	// TODO: clean note
	if(txt!=""){
		var bib = document.getElementById("bibtexsource").value;
		var bib_object = bibtex2JSON(bib);
		bib_object[0].properties.note = txt;
		var bibSource = cite.set(bib_object).get({format:"string",type:"string",style:"bibtex"});
		$("#bibtexsource").val(bibSource);
	}
}

function addLocationFromHelper(){
		var txt = $("#SampleLocation").val();
		txt = txt.trim();
		if(txt.length>0){
			txt += "; "
		}
		txt += $('#country-selector').val();
		$("#SampleLocation").val(txt);
		$('#country-selector').val("");
		$('#SampleLocation').get(0).scrollLeft = $('#SampleLocation').get(0).scrollWidth; 
	}

function offerCausalLinksAsCSV(){
	var data = $('#jsGrid').jsGrid('option', 'data');

	var trueHeaders = ["Var1","Relation","Var2","Cor","Subject","Type","SampleN","SampleLocation","SampleDemographic","AnalysisType","AnalysisDetails","StatType","Stat","Confirmed","Notes"];
	var csvData = JSONToCSVConvertor(data, true,trueHeaders);

	var link = document.createElement('a');
	link.style.display = 'none';
	link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvData);
	link.download = "CausalLinks.csv"
	document.body.appendChild(link);
  	link.click();
 	document.body.removeChild(link);
}



function filterWithMaxLengthLimit(request, response) {
		// return top 8 hits from 'existingVariables'
        var results = $.ui.autocomplete.filter(existingVariables, request.term);
        response(results.slice(0, 8));
    }

function recieveVariablesFromServer(response){
	var varObj = JSON.parse(response);
	var vars = [];
	for(var i = 0; i < varObj.length;++i){
		vars.push(varObj[i].name);
	}
	//console.log("Variables");
	//console.log(vars);
	existingVariables = vars;
	// Add variables from cookie
	existingVariables = existingVariables.concat(tmpVariables);

	// It's now safe to load other things, like for editing a document
	// (loadDataFromDocument() does nothing if there is no url parameter "document")
	loadDataFromDocument();
}



// ----------------------------- //
//  Editing existing documents
// ----------------------------- //

function getUrlParameter(sParam) {
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

// Fill the grid with data from the database
//  so the user can edit stuff
function loadDataFromDocument(){
	// Check if url parameter specifies document to add from
	var documentKey = getUrlParameter('document');
	console.log(documentKey);
	if((documentKey!==undefined) && (documentKey!='')){
		editingExistingData = true;
		// request links
		requestRecord("php/getLinksForDoc.php", "key="+documentKey,'links');
		// request bib data
		requestRecord("php/getDoc.php", "key="+documentKey,'bib');
	}
}

function updateRecord(response, type){
	if(type=='bib'){
		// recieving bib details from server: 
		//   add to bibtexsource
		response = JSON.parse(response);
		document.getElementById('bibtexsource').value = response[0].record;
		// Update bib and key variables
		updateBib();
		var bib = document.getElementById("bibtexsource").value;
		var bib_object = bibtex2JSON(bib);
		if(bib_object!="Cannot parse bibtex file"){
			bib2GeneralNotes(bib_object[0].properties.note);
		}
	}
	if(type=='links'){
		// receiving causal links details from server
		response = JSON.parse(response);
		console.log("ADD DOC");
		console.log(response);
		// Add row one at a time
		for(var i=0;i<response.length;++i){
			addRowToGrid(response[i]);
		}
		// Redraw grid
		redrawGUIfromGrid();
		// Show the causal links tab
		$('.nav-tabs a[href="#causal_links"]').tab('show');
		// Hide the saved data message
		$('#SavedDataAlert').hide();
		network.fit();
	}
	if(type=="docs"){
		// Use this list of documents to check if someone has already submitted 
		existingDocuments = JSON.parse(response);
		// convert to lowercase for comparison
		for(var i=0;i<existingDocuments.length;++i){
			existingDocuments[i].title = simplifyTitle(existingDocuments[i].title);
		}
	}
}

// ------------------------------------------- //
//        Warn user before unloading
// ------------------------------------------- //

window.addEventListener("beforeunload", function (e) {
	if(!submissionFinished){
	    var confirmationMessage = 'It looks like you have been editing something. '
	                            + 'If you leave before saving, your changes will be lost.';

	    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
	    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
	}
});
// ------------------------------------------- //

$(document).ready(function(){

	// If the user has stuff saved in a cookie, then hide the help alert
	var cookie_user = Cookies.get('github.username');
	if(cookie_user!=undefined){
		$("#helpAlert").hide();
	}

	if(Cookies.get("GridSaveData")==undefined){
		// Ask user if they want to load old data
		$("#SavedDataAlert").hide();
	}
	if(Cookies.get("acceptCookies")!=undefined){
		$("#CookieAlert").hide();
	}

	// Hide validation warnings
	hideAlerts();
	

	// getVersion checks whether cookies are up to date.
	// if it is, then we load temp cookies from server
	// then get the full list of variables from the server
	// if it isn't, then clear cookie variables and then get full
	// list of variables from the server
	getVersion();  // eventually triggers recieveVersion() and recieveVariablesFromServer()


	// request the list of documents
	requestRecord("php/getDocsForAddData.php","",'docs');


	$("#header").load("header.html", function(){
		$("#AddDataHREF").addClass("active");
	}); 

	// make causal links table
	prepareTable();
	// assign function to update bibtex
	$("#bibtexsource").change(function(){
    	updateBib();
	}); 
	$("#bibtexsource").keyup(function(){
    	updateBib();
	}); 
	// Add General note changes to bibtex
	$("#generalNote").change(function(){
		generalNotes2Bib();
	});
	$("#generalNote").keyup(function(){
		generalNotes2Bib();
	});

	// clear bibtex source
	$("#bibtexsource").val("");
	// set function to submit to github on click
	$('#submitToGitHub').attr('onclick', 'submitToGitHub()');

	// Initialise the visual network
	network_options.edges.smooth = false;
	initialiseNetwork();

	// Bind clicks to making list of variables appear
	  $( "#searchVariablesToAdd_dynamic" ).keypress(function(event) {
	  	if ( event.key == "Enter" || event.which==13 ) {
	  		addVar_dynamic();
	  		$("#searchVariablesToAdd_dynamic").hide();
	  		$(".ui-menu").hide(); 
		} else{
			if ( event.key == "Escape" || event.which==27 ) {
				$("#searchVariablesToAdd_dynamic").hide();
				$(".ui-menu").hide(); 
			}
		}
	  });
	// If user clicks away, hide the search bar
	$( "#searchVariablesToAdd_dynamic" ).blur(function(event){
		$("#searchVariablesToAdd_dynamic").hide();
		$(".ui-menu").hide(); 
	});
	$("#searchVariablesToAdd_dynamic").val("");
	$("#searchVariablesToAdd").val("");

	// Bind clicks to select network nodes
	network.on("click", network_on_click);
    network.on("doubleClick", network_on_double_click);
    // For drawing live links
    network.on("afterDrawing", dragToDrawConnections);
    // For drawing help
    network.on("beforeDrawing", drawHelp);
    // Beware: network removes listeners after redraw, so can't add the listener to the network 
    document.addEventListener('mousemove', getMousePos, false);
    // When mouse leaves network box, deselect everything
    document.getElementById("mynetwork").onmouseleave = function(){
    		current_selection_mode="start";
    	};

	// Load username from cookie
	checkGithubUserCookie();
	
	// swich to first tab (contributor ID)
	$('#navTabs a:first').tab('show');

	initialiseFileUpload();  // see js/util/fileUpload.js

	$("#drawLinks").attr("onclick","toggleDrawLinks()");

	// Open up add row in grid
	var gridAddButton = document.getElementsByClassName("jsgrid-button jsgrid-mode-button jsgrid-insert-mode-button")[0];
	gridAddButton.click();

	// Add suggestions to "add" input
	// (note this will only work after existingVariables is loaded)
	$("#searchVariablesToAdd").autocomplete({
			source:filterWithMaxLengthLimit
		});
	$("#searchVariablesToAdd_dynamic").autocomplete({
			source:filterWithMaxLengthLimit
		});

	// Make network box resizable
	$( "#mynetwork" ).resizable();
	
	
	// country selector
	$("#country-selector").load("LocationHelper.html", function(){
		// after load
		$('#country-selector').selectToAutocomplete();
	});
	$('#addLocation').click(addLocationFromHelper);
	// input for country selector
	$('#country-selector').next().keyup(function(event){
		// if pressed enter
		if ( event.which == 13 ) {
			addLocationFromHelper();
		}
	});

});





