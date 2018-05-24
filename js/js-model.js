const CANVAS_WIDTH = 490
const CANVAS_HEIGHT = 490 

// const OUTPUT_SHAPE = [7,7,5+NUM_CLASSES+1]

let ACTIVATION; //for console testing

function getVideoFrame(){
   var canvas = document.querySelector('.dcanvas');
   var video = document.querySelector('#barCodeReader > video');

  var ctx = canvas.getContext('2d');

  // Change the size here
  canvas.width = CANVAS_WIDTH;
  canvas.height =  CANVAS_HEIGHT;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
 
  return canvas;

}
/**
 * A class that wraps webcam video elements to capture Tensor4Ds.
 */
 class Webcam {
  /**
   * @param {HTMLVideoElement} webcamElement A HTMLVideoElement representing the webcam feed.
   */
  constructor(webcamElement) {
    this.webcamElement = webcamElement;
  }

  /**
   * Captures a frame from the webcam and normalizes it between -1 and 1.
   * Returns a batched image (1-element batch) of shape [1, w, h, c].
   */
  capture() {
    return tf.tidy(() => {
      // Reads the image as a Tensor from the webcam <video> element.
      const webcamImage = tf.fromPixels(this.webcamElement);

      // Crop the image so we're using the center square of the rectangular
      // webcam.
      const croppedImage = this.cropImage(webcamImage);

      // Expand the outer most dimension so we have a batch size of 1.
      const batchedImage = croppedImage.expandDims(0);

      // Normalize the image between -1 and 1. The image comes in between 0-255,
      // so we divide by 127 and subtract 1.
      return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    });
  }

  /**
   * Crops an image tensor so we get a square image with no white space.
   * @param {Tensor4D} img An input image Tensor to crop.
   */
  cropImage(img) {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [224, 224, 3]);
  }
}


/**
 * A dataset for webcam controls which allows the user to add example Tensors
 * for particular labels. This object will concat them into two large xs and ys.
 */
 class ModelDataset {
  
  /**
   * Adds an example to the controller dataset.
   * @param {Tensor} example A tensor representing the example. It can be an image,
   *     an activation, or any other type of Tensor.
   * @param {number} label The label of the example. Should be an umber.
   */
  addExample(example, y) {
    // One-hot encode the label.
    //y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]).toInt(), numClasses)); //for object classification only

    if (this.xs == null) {
      // For the first example that gets added, keep example and y so that the
      // modelDataset owns the memory of the inputs. This makes sure that
      // if addExample() is called in a tf.tidy(), these Tensors will not get
      // disposed.
      this.xs = tf.keep(example);
      this.ys = tf.keep(y);
    } else {
      const oldX = this.xs;
      this.xs = tf.keep(oldX.concat(example, 0));

      const oldY = this.ys;
      this.ys = tf.keep(oldY.concat(y, 0));

      oldX.dispose();
      oldY.dispose();
      y.dispose();
    }
  }
}



//should not be hardcoded!
var NUM_CLASSES;
var class_names = {}

// The dataset object where we will store activations.
let modelDataset = new ModelDataset();


var mobilenet;
let model;

// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
async function loadMobilenet() {
  const mobilenet = await tf.loadModel(
      'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer('conv_pw_13_relu');
  // for(let i = 0;i<mobilenet.layers.length;i++){
  //   console.log(mobilenet.layers[i].name,mobilenet.layers[i].output.shape);
  // }
  M.toast({
        html: 'Model loaded...',
        displayLength: 1000
    })
  return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
}

// When the UI buttons are pressed, read a frame from the webcam and associate
// it with the class label given by the for example, bananas, oranges are
// labels 0, 1 respectively.
function setExampleHandler(label) {
  console.log('Adding samples for ',label)
  tf.tidy(() => {
    webcam = new Webcam(getVideoFrame());
    const img = webcam.capture();
    console.log(img.data())
    modelDataset.addExample(mobilenet.predict(img), label);
  });
}

function sokoCustomModelInit(){
  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.


  model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.conv2d({
        inputShape: [7, 7, 256],
        kernelSize: 1,
        filters: 5+NUM_CLASSES+1,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      tf.layers.batchNormalization({
        axis: -1
      }),
      tf.layers.conv2d({
        kernelSize: 1,
        filters: 5+NUM_CLASSES+1,
        strides: 1,
        activation: 'relu',
        useBias: false
      })
    ]
  });


  // Creates the optimizers which drives training of the model.
  const optimizer = tf.train.adam(0.001);
  // We use categoricalCrossentropy which is the loss function we use for
  // categorical classification which measures the error between our predicted
  // probability distribution over classes (probability that an input is of each
  // class), versus the label (100% probability in the true class)>
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

}

async function train() {

  if (modelDataset.xs == null) {
    throw new Error('Add some examples before training!');
  }
  sokoCustomModelInit()
  const lossValues = [];
  const accuracyValues = [];

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends on how many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize = Math.floor(modelDataset.xs.shape[0] * 1);
  if (!(batchSize > 0)) {
    throw new Error(`Batch size is 0 or NaN. Please choose a non-zero fraction.`);
  }

  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.


  for (let i = 0; i < 1000; i++) {
    const history = await model.fit(modelDataset.xs, modelDataset.ys, {batchSize: batchSize,epochs: 1});
    const loss = history.history.loss[0];
    const accuracy = history.history.acc[0];
    console.log(loss,accuracy)
    // lossValues.push({'batch': i, 'loss': loss, 'set': 'train'});
    // plotLosses(lossValues)
    // accuracyValues.push({'batch': i, 'accuracy': accuracy, 'set': 'train'});
    // plotAccuracies(accuracyValues)

    await tf.nextFrame();

  }      
}


let Predicting = true;

async function predict() {
  while (Predicting) {
    toggleModalFooterOnRectDrawInit(true)
    clearBbox()
    const predictedClass = tf.tidy(() => {

      // Capture the frame from the webcam.
      webcam = new Webcam(getVideoFrame());
      const img = webcam.capture();

      // Make a prediction through mobilenet, getting the internal activation of
      // the mobilenet model.
      const activation = mobilenet.predict(img);

      // Make a prediction through our newly-trained model using the activation
      // from mobilenet as input.
      const predictions = model.predict(activation);
      //returns boxxes and corresponding classes
      return predictions;
    });

    const activations = (await predictedClass);
    inference(activations.dataSync());
    activations.dispose()
    await tf.nextFrame();
  }
  if (!Predicting) {
    toggleModalFooterOnRectDrawInit(false)
  }
  
}

const lossLabelElement = document.getElementById('loss-label');
const accuracyLabelElement = document.getElementById('accuracy-label');
 function plotLosses(lossValues) {
  // vegaEmbed(
  //     '#lossCanvas', {
  //       '$schema': 'https://vega.github.io/schema/vega-lite/v2.json',
  //       'data': {'values': lossValues},
  //       'mark': {'type': 'line'},
  //       'width': 260,
  //       'orient': 'vertical',
  //       'encoding': {
  //         'x': {'field': 'batch', 'type': 'ordinal'},
  //         'y': {'field': 'loss', 'type': 'quantitative'},
  //         'color': {'field': 'set', 'type': 'nominal', 'legend': null},
  //       }
  //     },
  //     {width: 360});
  lossLabelElement.innerText =
      'Loss: ' + lossValues[lossValues.length - 1].loss.toFixed(2);
}

 function plotAccuracies(accuracyValues) {
  //| TO USE: UNCOMMENT SOME SCRIPTS in index.html (just below js-model.js import)
  // vegaEmbed(
  //     '#accuracyCanvas', {
  //       '$schema': 'https://vega.github.io/schema/vega-lite/v2.json',
  //       'data': {'values': accuracyValues},
  //       'width': 260,
  //       'mark': {'type': 'line', 'legend': null},
  //       'orient': 'vertical',
  //       'encoding': {
  //         'x': {'field': 'batch', 'type': 'ordinal'},
  //         'y': {'field': 'accuracy', 'type': 'quantitative'},
  //         'color': {'field': 'set', 'type': 'nominal', 'legend': null},
  //       }
  //     },
  //     {'width': 360});
  accuracyLabelElement.innerText = 'Acc: ' +
      (accuracyValues[accuracyValues.length - 1].accuracy * 100).toFixed(2) +
      '%';
}


//custom inference function,
// you feed it class id predicted by the model.

function inference(activations){
    processOutput(splitUp(activations,49)) // should not be hardcoded its the (model.output.shape[1] * model.output.shape[2]),
   
}
  

async function warmUpModel() {
  mobilenet = await loadMobilenet();

  webcam = new Webcam(getVideoFrame());
  // Warm up the model. This uploads weights to the GPU and compiles the WebGL
  // programs so the first time we collect data from the webcam it will be
  // quick.
  tf.tidy(() => mobilenet.predict(webcam.capture()));
}


function loadProductImage(src){
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = 'https://bitsoko.io'+src
    img.crossOrigin = "anonymous";
  })
}

function getThisShopProducts(s){
  getObjectStore('data', 'readwrite').get('soko-store-' + localStorage.getItem('soko-active-store') + '-products').onsuccess = function (event) {
        var reqs = event.target.result;
        try {
            reqs = JSON.parse(reqs);
        } catch (err) {
            reqs = []
        };

        console.log(reqs)

        NUM_CLASSES = (reqs.length > 1) ? reqs.length : 2
        console.log(NUM_CLASSES)

        var trainingClassesSelectElement = (s == true) ? document.querySelector('#trainingClass') : document.querySelector('#trainingBoxLabel')
       
        var option;
        for (var i = 0; i < reqs.length; i++) {
          console.log(reqs[i].name)
          option = document.createElement("option")
          option.text = reqs[i].name
          option.value = i
          trainingClassesSelectElement.add(option)

          class_names['prid-'+i]= reqs[i].name
          if (reqs[i].imagePath != null) {
              loadProductImage(reqs[i].imagePath).then(e =>{
              webcam = new Webcam(e);
              console.log(webcam.capture().data())
            })
          }
          
        }
        $('select').formSelect();

        sokoCustomModelInit()
        restoreThisShopModel()
    }
}


//+SAVE THIS SHOP MODEL+

async function saveThisShopModel(){
  const saveResults = await model.save('indexeddb://soko-store-'+localStorage.getItem('soko-active-store')+'-model-weights');
  console.log(saveResults)
}

async function restoreThisShopModel(){  
  model = await tf.loadModel('indexeddb://soko-store-'+localStorage.getItem('soko-active-store')+'-model-weights');
  console.log(model)
}


function aiModeInitialization() {
  M.toast({
    html: 'Loading model...',
    displayLength: 3000
  })
  warmUpModel()
   
}

$(".trainModel").click(function () {
    $("#trainingClasses").modal({
        onOpenStart: function () {
        },
        onOpenEnd: function () {
        },
        onCloseEnd: function () {
        }
    }).modal('open');

})

$(document).ready(function(){
  getThisShopProducts(false)
  aiModeInitialization()
})


//START:: DATA COLLECTION
function resize_canvas()
{
  var element = document.getElementById("quagaLauncher")
  var w = element.offsetWidth;
  var h = element.offsetHeight;
  var cv = document.getElementById("quagaLauncherCanvas");
  cv.style.width = w+'px';
  cv.style.height =h+'px';
}
window.addEventListener("resize", resize_canvas);


initDraw(document.getElementById('quagaLauncherCanvas'));



function initDraw(canvas) {
    canvas.width = CANVAS_WIDTH;
    canvas.height =  CANVAS_HEIGHT;
    function setMousePosition(e) {
        var ev = e || window.event; //Moz || IE
        if (ev.pageX) { //Moz
            mouse.x = ev.pageX - $('#quagaLauncherCanvas').offset().left;
            mouse.y = ev.pageY - $('#quagaLauncherCanvas').offset().top;
        } 
    };

    var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;
    var label = null;

    canvas.onmousemove = function (e) {
        setMousePosition(e);
        if (element !== null) {
            element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
            element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
            element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
            element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
        }
    }

    canvas.onclick = function (e) {
        if (element !== null) {
            element = null;
            label = null;
            canvas.style.cursor = "default";
            console.log("finsihed.");

            $("#dataCollectionBoxLabels").modal({
              onOpenStart: function(){

              },
              onOpenEnd: function(){
                getThisShopProducts(false);

              },
              onCloseEnd: function(){
                saveAnnotatedProductBoxes(mouse)
                toggleModalFooterOnRectDrawInit(false)
                toggleVideoStreamForDataCollection(false)
              }
            }).modal('open')
        } else {
            console.log("begun.");
            toggleVideoStreamForDataCollection(true)
            toggleModalFooterOnRectDrawInit(true)
            mouse.startX = mouse.x;
            mouse.startY = mouse.y;
            element = document.createElement('fieldset');
            label = document.createElement('legend')
            label.style.color = "#fff"
            label.innerHTML = "_"
            element.appendChild(label)
            element.className = 'rectangle'
            element.style.left = mouse.x + 'px';
            element.style.top = mouse.y + 'px';
            canvas.appendChild(element)
            canvas.style.cursor = "crosshair";
        }
    }
}

function toggleModalFooterOnRectDrawInit(started){
  if (started) {
    document.getElementById("quagaLauncherCanvas").style.zIndex = "20"
    document.getElementById("quagaLauncherModalFooter").style.zIndex = "10"
    document.getElementById("quagaLauncherModalFooter").style.display = "none"
  }else{
    document.getElementById("quagaLauncherCanvas").style.zIndex = "10"
    document.getElementById("quagaLauncherModalFooter").style.zIndex = "20"
    document.getElementById("quagaLauncherModalFooter").style.display = "block"
  }

}

function toggleVideoStreamForDataCollection(t) {
  // body...
  if (t) {
    document.getElementById("quagaLauncher").pause()
  }else{
    document.getElementById("quagaLauncher").play()
  }
  
}

function updateBboxLabel(id){
  $("#quagaLauncherCanvas").children('fieldset').last().children('legend')[0].innerHTML = id
}

function bboxesYoloFormat(size, bboxes){
  var dw = 1./size[0]
  var dh = 1./size[1]
  var x = (bboxes[0] + bboxes[1])/2.0
  var y = (bboxes[2] + bboxes[3])/2.0
  var w = bboxes[1] - bboxes[0]
  var h = bboxes[3] - bboxes[2]
  x = x*dw
  w = w*dw
  y = y*dh
  h = h*dh
  return [x,y,w,h]
}

function getBboxMidpointsXY(bboxes) {
  let midpoints = {
    midpointX:null,
    midpointY:null
  }
  midpoints.midpointX = (bboxes[1]-bboxes[0])/2
  midpoints.midpointY = (bboxes[3]-bboxes[2])/2
  return midpoints
}

function objectLocation(midpoints){
  const cells = 7 //must be a number that divides the square(image) into equal grids
  let b = []
  for(let i=0;i<=cells;i++){b.push(i*(CANVAS_WIDTH/cells))}
  var cell = {
    x:null,
    y:null
  }
  for(let i=0;i<b.length;i++){
    if(i != b.length-1){
      if(midpoints.midpointX >= b[i] && midpoints.midpointX <= b[i+1] ){
        cell.x = i+1
      }
      if(midpoints.midpointY >= b[i] && midpoints.midpointY <= b[i+1] ){
        cell.y = i+1
      }
    }
  }
  return cell
}

function theYs(iRows, iCols,cell,bboxes,label) {
  var i;
  var j;
  var table = new Array(iRows);
  let y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]).toInt(), NUM_CLASSES+1)); 
  let background_label = tf.tidy(() => tf.oneHot(tf.tensor1d([NUM_CLASSES]).toInt(), NUM_CLASSES+1));
  y = Array.from(y.dataSync());
  background_label = Array.from(background_label.dataSync());

  var default_boxes =[]
  for (var i = 0; i < bboxes.length; i++) {
    default_boxes.push(Math.floor(Math.random() * 10) + 1 )
  }
  
  for (i = 0; i < iRows; i++) {
    table[i] = new Array(iCols);
    for (j = 0; j < iCols; j++) {
      var real_y = []
      if (cell.x == i && cell.y == j) {
        table[i][j] = real_y.concat([1]).concat(bboxes).concat(y)
      }else{
        table[i][j] = real_y.concat([0]).concat(default_boxes).concat(background_label)  
      }
    }
  }
  return (table);
} 


//on dev >> next
function saveAnnotatedProductBoxes(bboxes){
  var canvas = getVideoFrame()
  var bb = bboxesYoloFormat([canvas.width,canvas.height],[bboxes.startX,bboxes.x,bboxes.startY,bboxes.y])
  var label = document.querySelector('#trainingBoxLabel').value;
  updateBboxLabel(label)
  let y = theYs(7,7,objectLocation(getBboxMidpointsXY([bboxes.startX,bboxes.x,bboxes.startY,bboxes.y])),bb,label)
  y = tf.tensor(y,[7,7,5+NUM_CLASSES+1])
  y.reshape([1,7,7,5+NUM_CLASSES+1]).print()
  setExampleHandler(y.reshape([1,7,7,5+NUM_CLASSES+1]))
}


//processing [1,7,7,8] model output @[pr(object in cell),x,y,w,h,NUM_CLASSES+1] 
//e.g an array of 8 elements where i have only two products in my shop

//called from inference
function splitUp(arr, n) {
    var rest = arr.length % n, // how much to divide
        restUsed = rest, // to keep track of the division over the elements
        partLength = Math.floor(arr.length / n),
        result = [];

    for (var i = 0; i < arr.length; i += partLength) {
        var end = partLength + i,
            add = false;

        if (rest !== 0 && restUsed) { // should add one element for the division
            end++;
            restUsed--; // we've used one division element now
            add = true;
        }

        result.push(arr.slice(i, end)); // part of the array

        if (add) {
            i++; // also increment i in the case we added an extra element for division
        }
    }

    return result;
}

function yoloFormatTobboxes(size, bboxes){
  var dw = 1./size[0]
  var dh = 1./size[1]
  var x = (bboxes[0] + bboxes[1])/2.0
  var y = (bboxes[2] + bboxes[3])/2.0
  var w = bboxes[1] - bboxes[0]
  var h = bboxes[3] - bboxes[2]
  x = x*dw
  w = w*dw
  y = y*dh
  h = h*dh
  return [x,y,w,h]
}

function processOutput(output){
  let canvas = document.getElementById('quagaLauncherCanvas')
  col_rows =[]
  for(var i=0;i<7;i++){for (var j=0;j<7;j++){col_rows.push([i,j])}}
  for (var i = 0; i < output.length; i++) {
    var y_hat = output[i]
    if (y_hat[0] != 0) { //probability of objectness in  the first cell
      let confidence = tf.sigmoid(tf.tensor(y_hat.slice(0,1)))
      let class_probs = tf.softmax(tf.tensor(y_hat.slice(5))).as1D().argMax()
      let predictedClass = class_probs.dataSync()[0]
      class_probs.dispose()
      let box_xy = tf.div(tf.add(tf.tensor(col_rows[i]),tf.sigmoid(tf.tensor(y_hat.slice(1,3)))),tf.tensor(7)) // 7 output shape
      let box_wh = tf.div(tf.add(tf.tensor([0.0, 0.0]),tf.exp(tf.tensor(y_hat.slice(3,5)))),tf.tensor(7))
      let box_mins = tf.sub(box_xy, tf.div(box_wh, tf.tensor1d([2.0])));
      let box_maxes = tf.add(box_xy, tf.div(box_wh, tf.tensor1d([2.0])));
      box_mins = tf.mul(box_mins, tf.tensor(parseInt(canvas.style.width,10))) // 490 should be the size of original input and not hard-coded 
      box_maxes = tf.mul(box_maxes,tf.tensor(parseInt(canvas.style.width,10)))
      boxes = box_mins.concat(box_maxes)
      boxes = boxes.dataSync()
      let [top, left, bottom, right] = boxes;
      top = Math.max(0, top);
      top = (parseInt(canvas.style.height,10)) < top ? parseInt(canvas.style.height,10) : top
      left = Math.max(0, left);
      left = (parseInt(canvas.style.width,10)) < left ? parseInt(canvas.style.width,10) : left
      bottom = Math.min(parseInt(canvas.style.height,10), bottom);
      right = Math.min(parseInt(canvas.style.width,10), right);
      console.log([parseInt(canvas.style.width,10),parseInt(canvas.style.height,10)],[top, left, bottom, right])
      drawBbox(left.toFixed(0), top.toFixed(0), (right-left).toFixed(0), (bottom-top).toFixed(0),predictedClass);
    }
  }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function drawBbox(x, y, w, h, l) {
  console.log(x, y, w, h)
  let canvas = document.getElementById('quagaLauncherCanvas')
  const element = document.createElement('fieldset');
  label = document.createElement('legend')
  label.style.color = "#fff"
  label.innerHTML = l
  element.appendChild(label)
  element.className = 'rectangle';
  element.style.top = y+ 'px';
  element.style.left = x+ 'px';
  element.style.width = w+ 'px';
  element.style.height = h+ 'px';
  element.style.borderColor = getRandomColor();
  canvas.appendChild(element);
}

function clearBbox() {
  const rects = document.getElementsByClassName('rectangle');
  while(rects[0]) {
    rects[0].parentNode.removeChild(rects[0]);
  }
}


