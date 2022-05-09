

// Handle File Drop (SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop)
function dropHandler(ev) {
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        console.log('... file[' + i + '].name = ' + file.name);
        let reader = new FileReader();
        reader.onload = function(e) {
            let arrBuff = new Uint8Array(reader.result); // SOURCE: https://stackoverflow.com/questions/59760536/read-file-from-relative-path-as-arraybuffer
            uploadedDoc = new documentToMine(arrBuff, document.getElementById("topic").value);
        }
        reader.readAsArrayBuffer(file);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  }
}

// Override standard dragging behavior (SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop)
function dragOverHandler(ev) {
  console.log('File(s) in drop zone');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

var uploadedDoc = null;

// When document is uploaded, read the file and pass it as an array buffer to the library's function
document.getElementById("file").onchange = e => {
    const file = e.target.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
        let arrBuff = new Uint8Array(reader.result); // SOURCE: https://stackoverflow.com/questions/59760536/read-file-from-relative-path-as-arraybuffer
        uploadedDoc = new documentToMine(arrBuff, document.getElementById("topic").value);
        
    }
    reader.readAsArrayBuffer(file);
  }

// Function to download a file with a given text (SOURCE: https://stackoverflow.com/questions/45831191/generate-and-download-file-from-js)
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


// Action when the download button is clicked
document.querySelector(".dwnbutton").onclick = ()=>{
  const ankiCards = uploadedDoc.getAnkiCards();
  download("ankiBatch.txt", ankiCards);
}

// Initially hides the download button upon loading
window.onload = function (){
  document.querySelector(".dwnbutton").style.visibility = "hidden";
}

// Reveals download button once file is read
function documentReadyForDownload(){
  document.querySelector(".dwnbutton").style.visibility = "visible";
}

// Object class for the PDF
function documentToMine(arrBuff, topic) {
    this.loaded = false;
    this.statements = []
    this.topic = topic;
    this.fileType = "pdf"
    // Callback function for pdf reader after every page of the pdf
    this.getStatementsFromPage = (text, pageNumber) => {
        console.log("THE PAGE NUMBER IS: " + pageNumber + "\nTHE TEXT IS: " + text );
        // Regular Expression that matches to a statement
        let re = new RegExp("(Definition|Proposition|Example).+?\.(?:(?!(Definition|Proposition|Example|Proof)).)*", "g");
        console.log("MATCH OF REGEX ON PAGE " + pageNumber + " IS: \n");
        console.log(text.match(re));
        if (text.match(re) !== null) {
          // Loop through array of statements from regex match
          text.match(re).forEach(m => {
            // Create Statement object with type, content, id, page number, and topic
            statement = new Statement(m.match(/(Proposition|Example|Definition)/g)[0],
                                          m.replace(/((Proposition|Definition|Example)).+?(?=[\D])(?!\.)/g,""),
                                          m.match(/(?<=(Proposition|Definition|Example)).+?(?=[\D])(?!\.)/g)[0], 
                                          pageNumber,
                                          this.topic);
            // Print each structure for further dev:
            console.log("STATEMENT IS: ")
            console.log(statement)
            // Add statement to array of statements
            this.statements.push(statement);
          });
        }
    }

    // Callback function for pdf reader after reading
    this.reportAfterRead = (txt, pgs) => {
        this.rawText = txt;
        this.pageTotal = pgs;
        this.loaded = true;
        documentReadyForDownload()
    }
    // Create new object and call pdf reader with callback functions
    let pdff = new Pdf2TextClass();
    pdff.pdfToText(arrBuff, this.getStatementsFromPage, this.reportAfterRead)

    // Create template with all Anki cards
    this.getAnkiCards  = () => {
      if (this.loaded) {
        csvContent = ""
        for (const statement of this.statements) {
          let ak = statement.createAnkiCard();
          //Get rid of whitespace from template and make sure \r is inserted
          csvContent += ak.replace(/\n/g, "") + "\r\n"
        }
        return(csvContent)
      } 
      alert("Please wait until the document loads.");
      }
}

// Object class for every statement
function Statement(type, content, id, pageNumber, topic) {
  this.content = content;
  this.type = type;
  this.id = id;
  this.topic = topic;
  this.pageNumber = pageNumber;
  this.createAnkiCard = function () {
    let mainText = this.content;
    // Regular expressions considered for math. If we want to expand, these can later on depennd on this.content
    const regExpressions = [/(?<=if.+then.).*/gi, /(?<=is).+(?=if|for)/gi, /(?<=if and only if).+/g, /(?<=Let.+Then).+(?=is)/gi, /(?<=Let.+\.\sThe).+(?=is)/g, /(?<=Suppose.+Then).+/gi]
    // Matches statement to regular expression in regExpressions until it finds a match
    let basicCardFlag = true;
    for (const re of regExpressions) {
      if(this.content.match(re) !== null){
          basicCardFlag = false
          let answers = this.content.match(re);
          // Inserts the cloze formatting around the Regex match in the statement
          mainText = this.content.replace(
            re,
            "{{c1:: " + answers[answers.length - 1] + "}}"
          ); 
          break;
        }
      }
      // Adds cloze to end of statement if there is not regex match so it can still work in Anki
      mainText += basicCardFlag ? "{{c1:: }}" : "";
      
    // Returns Anki template for the statement
    return `"<style>
    .card{
        margin: 0 !important;
        padding: 0 !important;
    }
    .container{
        padding: 0;
        margin: 0;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%; 
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background-color: #e5e5f7;
        background-image:  linear-gradient(rgba(0,0,255,0.3) 1.8px, transparent 1.8px), linear-gradient(90deg, rgba(0,0,255,0.3)1.8px, transparent 1.8px), linear-gradient(#000dff 0.9px, transparent 0.9px), linear-gradient(90deg, #000dff 0.9px, #e5e5f7 0.9px);
        background-size: 45px 45px, 45px 45px, 9px 9px, 9px 9px;
        background-position: -1.8px -1.8px, -1.8px -1.8px, -0.9px -0.9px, -0.9px -0.9px;
    }

    .flashcard{
        background-color: #eee;
        padding: 2rem 3rem 5rem 3rem;
        min-height: 200px;
        min-width: 150px;
        width: 70%;
        height: 40%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: stretch;
    }

    h1 {
      text-align: center;
      font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
        'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
      font-size: 3rem;
      color: black;
      padding-top: 5rem;
      flex-grow: 1;
      margin: 0;
      
    }
    .card-content {
      text-align: center;
      font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
        'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
      font-size: 2rem;
      color: black;
      flex-grow: 1;
      padding: 1rem;
    }
  </style>
  
  <div class= 'container'>
      <div class='flashcard'>
          <h1>${this.topic}</h1>  
          <div class='card-content'>
              <b> ${this.type} </b> ${mainText}
          </div>
      </div>
  </div>"; "${this.type}"`
  };// End of createAnkiCard()
}


// Includes function to convert pdf to text (SOURCE: https://stackoverflow.com/questions/1554280/how-to-extract-text-from-pdf-in-javasript)
function Pdf2TextClass(){
  var self = this;
  this.complete = 0;

  this.pdfToText = function(data, callbackPageDone, callbackAllDone){
  var loadingTask = pdfjsLib.getDocument(data);
  loadingTask.promise.then(function(pdf) {
  var total = pdf._pdfInfo.numPages;
  //callbackPageDone( 0, total );     UNCOMMENT IF NEEDED    
  var layers = {};        
  for (i = 1; i <= total; i++){
     pdf.getPage(i).then( function(page){
     var n = page.pageNumber;
     page.getTextContent().then( function(textContent){
     //console.log(textContent.items[0]);0 UNCOMMENT IF NEEDED
       if( null != textContent.items ){
         var page_text = "";
         var last_block = null;
         for( var k = 0; k < textContent.items.length; k++ ){
             var block = textContent.items[k];
             if( last_block != null && last_block.str[last_block.str.length-1] != ' '){
                 if( block.x < last_block.x )
                     page_text += "\r\n"; 
                 else if ( last_block.y != block.y && ( last_block.str.match(/^(\s?[a-zA-Z])$|^(.+\s[a-zA-Z])$/) == null ))
                     page_text += ' ';
             }
             page_text += block.str;
             last_block = block;
         }

         textContent != null && console.log("page " + n + " finished."); //" content: \n" + page_text);
         layers[n] =  page_text + "\n\n";
       }
       ++ self.complete;
       callbackPageDone( layers[n], n);
       if (self.complete == total){
         window.setTimeout(function(){
           var full_text = "";
           var num_pages = Object.keys(layers).length;
           for( var j = 1; j <= num_pages; j++)
               full_text += layers[j] ;
            callbackAllDone(full_text, num_pages);
         }, 1000);              
       }
     }); // end  of page.getTextContent().then
   }); // end of page.then
 } // of for
});
  }; // end of pdfToText()
}; // end of class

