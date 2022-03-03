/*
    Javascript Program That Builds a Memory View
*/

// the height of each memory segment label
const segmentHeight = 20;

// the size of each memory segment for allocation
var segmentSize = 512; // default

// color for memory segments
var memoryForegroundColor = "#FFFFFF";
var memoryBackgroundColor = "#A9CCE3";
var memoryBorderColor = "#34495E";
var memoryRollBackgroundColor = "#A9CCE3";
var memoryWidth = 48;

// color for program segments
var programForegroundColor;
var programBackgroundColor = "#D6DBDF";
var programBorderColor = "#34495E";
var programRollBackgroundColor = "#85929E";
var programWidth = 128;

// bank zero color
var bank0BackgroundColor = "#F2F4F4";
var bank0BorderColor = "#34495E";

// rom colors
var romBackgroundColor = "#A9CCE3";
var romBorderColor = "#34495E"

// tooltip colors
var tooltipForegroundColor = "#34495E";
var tooltipBackgroundColor = "#D2B4DE";
var tooltipBorderColor = "#34495E";

// border width
var drawBorderWidth = 0.15;

// global vars
var frame;
var stage;
var stageW;
var stageH;

// parsed memory
var memoryData = [];

// rom memory
var memoryRom = [];
var showRoms = true;

/*
  Class: MemorySegment

  An Area of Memory that has a Top, Bottom and Name.

  For example, on the C64 the top of Memory is
  sometimes referred to as zero, or $0000. While
  the bottom might be referred to as 65536 or $ffff.

*/
class MemorySegment {
  constructor(top, bottom, text) {
    this.top = top;
    this.bottom = bottom;
    this.text = text;
  }
}

/*
    Draw a Memory Segment

    This draws the list of memory segments
    to show the entire 64K of the C64.

    It is similar to those that you might see
    by developers who use a spreadsheet to
    manually identify their program memory
    locations.

*/
function drawMemorySegments(segments) {
  
  segments.forEach((segment, index) => {

    var _label = new Label({
      font: "Tahoma",
      text: segment.text,
      size: 12,
      color: memoryForegroundColor,
      bold: false,
      labelWidth: memoryWidth,
      labelHeight: segmentHeight,
      maxSize: 12
    });

    var _button = new Button({
      label: _label,
      width: memoryWidth,
      height: segmentHeight,
      borderWidth: drawBorderWidth,
      borderColor: memoryBorderColor,
      backgroundColor: memoryBackgroundColor,
      rollBackgroundColor: memoryRollBackgroundColor,
      corner: 0,
      shadowColor: -1,
      }).pos(0, index * segmentHeight);

    stage.addChild(_button);


  });

}

/*
    Draw A Program Segment

    This will draw a box with a label that
    defines an area of memory that has
    been segmented in the Developers code.

    It also includes a Tooltip that will
    show when the Developer moves the
    mouse over a defined area.

*/
function drawProgramSegments(segments) {
  
  segments.forEach((segment, index) => {

    /*
        the height of the calculated segment will determine
        if we want to actually show the text when we draw

        the height we check against (14) was just determined by some
        trial and error and is a best guess based on the fact
        that we use a size of 12 when drawing, so we assume we can
        handle something with a 1 pixel buffer around it

        most of this is done by the zimjs framework so we are
        not 100% sure if this is the best way to do this, but
        for now it works

        the "labelWidth" property below controls the margin around the
        label that draws the text, as such it ultimately determines
        when a phrase will wrap to the next line. we chose to put
        that margin there so that text does not end up aligning
        with the box that is drawn around each value
    */

    var _height = ((segmentHeight/segmentSize) * (segment.bottom - segment.top));
    var _text = segment.text;

    if (_height < 14) {
      _text = "";
    }

    var _label = new Label({
      font: "Tahoma",
      text: _text,
      size: 12,
      color: programForegroundColor,
      bold: false,
      lineWidth: programWidth,
      labelWidth: programWidth * 0.90, // 10% margin
      labelHeight: _height,
      maxSize: 12,
      align: "center",
      valign: "center",
    });

    var _button = new Button({
      label: _label,
      width: programWidth,
      height: ((segmentHeight/segmentSize) * (segment.bottom - segment.top)),
      borderWidth: drawBorderWidth,
      borderColor: programBorderColor,
      backgroundColor: programBackgroundColor,
      rollBackgroundColor: programRollBackgroundColor,
      corner: 0,
      shadowColor: -1,
      }).pos(memoryWidth, ((segmentHeight/segmentSize) * segment.top));

      /*
          these two event listeners will control the
          showing and hiding of the tip/label that
          is defined below
      */

    _button.addEventListener("mouseover", function(event) { 
      event.target.tip.pos(stage.mouseX + 20, stage.mouseY + 10).top();
      stage.update();
    }); 

    _button.addEventListener("mouseout", function(event) { 
      event.target.tip.pos(-1000, -1000).bot();
      stage.update();
    }); 

    stage.addChild(_button);

    /*
        the tooltip is provided as a label that is
        hidden outside of the canvas, and then brought
        into view when the developer moves the mouse over
        a particular memory segment
    */

    var _size = segment.bottom - segment.top;
    var _size_bytes = `(${_size} bytes)`;

    var _l = `${toHex(segment.top)} --- ${toHex(segment.bottom)}\n\n${_size_bytes}\n\n${segment.text}`

    var _tip = new Label({
      font: "Tahoma",
      align: "center",
      valign: "middle",
      color: tooltipForegroundColor,
      corner: 0,
      size: 12,
      text: _l,
      backgroundBorderWidth: drawBorderWidth,
      backgroundColor: tooltipBackgroundColor,
      backgroundBorderColor: tooltipBorderColor,
    }).pos(-1000,-1000);

    stage.addChild(_tip);

    // give a reference to the tooltip to the button object

    _button.tip = _tip;

  });
}

/*
    Draw Bank Zero

    For right now we only have one Bank
    of memory that is drawn. To identify
    this, we draw a blank box that is the size
    of the allocated space.

    This is the equivalent of free ram when
    doing this on paper, so we do not provide
    any tooltips to show this, it is assumed.

*/
function drawBankZero() {

  var _label = new Label({
    text: "",
  });

var _button = new Button({
    label: _label,
    width: programWidth,
    height: segmentHeight * (65536/segmentSize),
    borderWidth: drawBorderWidth,
    borderColor: bank0BorderColor,
    backgroundColor: bank0BackgroundColor,
    rollBackgroundColor: bank0BackgroundColor,
    corner: 0,
    shadowColor: -1,
    }).pos(memoryWidth, 0);

  stage.addChild(_button);

}

function drawRoms(segments) {

  var _label = new Label({
    text: "",
  });

var _button = new Button({
    label: _label,
    width: memoryWidth,
    height: segmentHeight * (65536/segmentSize),
    borderWidth: drawBorderWidth,
    borderColor: bank0BorderColor,
    backgroundColor: bank0BackgroundColor,
    rollBackgroundColor: bank0BackgroundColor,
    corner: 0,
    shadowColor: -1,
    }).pos(memoryWidth + programWidth, 0);

  stage.addChild(_button);

  segments.forEach((segment, index) => {

    var _height = ((segmentHeight/segmentSize) * (segment.bottom - segment.top));
    var _text = segment.text;

    if (_height < 14) {
      _text = "";
    }

    var _label = new Label({
      text: _text,
      size: 12,
      color: romBorderColor,
      bold: false,
      lineWidth: memoryWidth,
      labelWidth: memoryWidth * 0.90, // 10% margin
      labelHeight: _height,
      maxSize: 12,
      align: "center",
      valign: "center",
    });

    var _button = new Button({
      label: _label,
      width: memoryWidth,
      height: ((segmentHeight/segmentSize) * (segment.bottom - segment.top)),
      borderWidth: drawBorderWidth,
      borderColor: romBorderColor,
      backgroundColor: romBackgroundColor,
      rollBackgroundColor: romBackgroundColor,
      corner: 0,
      shadowColor: -1,
      }).pos(memoryWidth + programWidth, ((segmentHeight/segmentSize) * segment.top));

    stage.addChild(_button);

  });

}

/*
    To Hex

    A convenience function to print out
    a Hex value with the traditional
    $ in front of it.

*/
function toHex(value) {
  var _s = "$" + ("0000" + value.toString(16)).substr(-4);
  return _s;
}

/*
    Parses the Assembly Output Memory Ranges

    This takes the compiled output from KickAssembler
    and parses our the Memory Segments that will
    show when the -showmem option is used (which is
    also the default).

    Thanks to SWOFFA et al. for the original
    code that did a great job parsing it out
    already. No need to reinvent the wheel here!

    https://kickassmemoryview.insoft.se/

*/
function parseMemory(data) {

	var patt=/^\s*(\*)?\$([0-9a-f]{4})\-\$([0-9a-f]{4})\s(.*)$/;
	var lines = data.split('\n')
	var rangeList = new Array()
  var _memlist = [];
  
	for (var i = 0 ; i < lines.length; i++) {

		var match = patt.exec(lines[i]);

		if(!match) {
			if(rangeList.length>1) break;
			else continue;
			}

    _memlist.push(new MemorySegment(parseInt(match[2], 16), parseInt(match[3], 16), match[4]));

	};

  return _memlist;
}

/*
    Create View

    This actually draws out the Memory View in the
    provider.

    type      the Type of View to Draw (right now there is one)

*/
function viewRefresh(type) {

  updateColors();

  let _size = segmentSize;
  let _top = 0;
  let _bot = _top + _size;

  // create memory label asegments that
  // represent the c64 in 2048 byte chunks

  var _segments = [];

  for(i=0; i < (65536/segmentSize); i++) {
    _segment = new MemorySegment(_top, _bot, toHex(_top));
    // _segment = new MemorySegment(_top, _bot, _top);
    _segments.push(_segment);
    _top += _size;
    _bot += _size;
  }

  stage.removeAllChildren(); // not sure why clear() was not working here?

  drawMemorySegments(_segments);

  drawBankZero(stage);

  if (memoryData.length > 0) {
    drawProgramSegments(memoryData);
  }

  if (showRoms) {
    drawRoms(memoryRom);
  }

  stage.update();

}


/*
    Creates The View Data And Refresh

    Usually called when the Developer
    assembles the source file and an
    object is created.
*/
function viewCreate(data) {

  memoryData = parseMemory(data.output);
  viewInit(data);
}

/*
    Initialize The Settings For the View

    Usually called when the Settings are
    updated in VSCode.

*/
function viewInit(data) {

  segmentSize = data.size;
  showRoms = data.showRoms;

  var _h = (65536/segmentSize) * segmentHeight;
  var _w = 384; // not sure we need this?

  frame.remakeCanvas(_w, _h);

  stage = frame.stage;
  stageW = frame.width;
  stageH = frame.height;

  viewRefresh(0);

}

/*
    handles the communication channel
    between our view container and
    vscode

    currently, the only handler is for setting
    the memory from a build and then creating
    the view from that build
*/
window.addEventListener('message', event => {

  const message = event.data;

  switch (message.type) {

    // refresh view 
    case 'view_refresh': {
      viewRefresh(0);
      break;
    }

    // set view data
    case 'view_create': {
      viewCreate(message.data);
      break;
    }

    // set view settings
    case 'view_init': {
      viewInit(message.data);
      break;
    }

    
  }
});

/*
    create the jimjs Frame that our
    contols will be using to draw on the
    cavas for our view

    the size is calculated using a combination
    of defined segment size and defined height
    for each segment

    some global variables are saved here which
    reference the Stage which is used for
    most interactions with the zimjs 
    framework

    https://zimjs.com/docs.html

*/

frame = new Frame("test", 384, 1, "#00000000", "#00000000");
  
frame.on("ready", () => {

  stage = frame.stage;
  stageW = frame.width;
  stageH = frame.height;

  stage.update();

  // create rom memory segments
  var _rom;
  _rom = new MemorySegment(40960, 49152, "Basic");
  memoryRom.push(_rom);
  _rom = new MemorySegment(57344, 65536, "Kernal");
  memoryRom.push(_rom);
  _rom = new MemorySegment(53248, 57344, "IO/Char");
  memoryRom.push(_rom);

});


function updateColors() {
  
  classColors = {};
  
  getColor("memoryForegroundColor");
  getColor("memoryBackgroundColor");
  getColor("memoryBorderColor");
  getColor("memoryRollBackgroundColor");

  memoryForegroundColor = classColors["memoryForegroundColor"];
  memoryBackgroundColor = classColors["memoryBackgroundColor"];
  memoryBorderColor = classColors["memoryBorderColor"];
  memoryRollBackgroundColor = classColors["memoryRollBackgroundColor"];

  getColor("programForegroundColor");
  getColor("programBackgroundColor");
  getColor("programBorderColor");
  getColor("programRollBackgroundColor");

  programForegroundColor = classColors["programForegroundColor"];
  programBackgroundColor = classColors["programBackgroundColor"];
  programBorderColor = classColors["programBorderColor"];
  programRollBackgroundColor = classColors["programRollBackgroundColor"];

  getColor("bankZeroBackgroundColor");
  getColor("bankZeroBorderColor");

  bank0BackgroundColor = classColors["bankZeroBackgroundColor"];
  bank0BorderColor = classColors["bankZeroBorderColor"];

  getColor("tooltipForegroundColor");
  getColor("tooltipBackgroundColor");
  getColor("tooltipBorderColor");

  tooltipForegroundColor = classColors["tooltipForegroundColor"];
  tooltipBackgroundColor = classColors["tooltipBackgroundColor"];
  tooltipBorderColor = classColors["tooltipBorderColor"];

  getColor("romForegroundColor");
  getColor("romBackgroundColor");

  romBackgroundColor = classColors["romBackgroundColor"];
  romBorderColor = classColors["romForegroundColor"];

}
// "Cache"
var classColors = {};

function getColor(className) {
    // Check for the color
    if (!classColors[className]) {

        // Create an element with the class name and add it to the dom
        $c = $('<div class="' + className + '"></div>').css('display', 'none');
        $(document.body).append($c);

        // Get color from dom and put it in the color cache
        classColors[className] = $c.css('color');

        // Remove the element from the dom again
        $c.remove();
    }

    // Return color
    return classColors[className];
}