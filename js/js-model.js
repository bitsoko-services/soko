//var imported = document.createElement('script');
//imported.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest';
//document.head.appendChild(imported);


var canvas = document.querySelector('.dcanvas');

 
function getVideoFrames(){
   var video = document.querySelector('#barCodeReader > div > video');

  var ctx = canvas.getContext('2d');

  // Change the size here
  canvas.width = 640;
  canvas.height =  480;
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
 class ControllerDataset {
  constructor(numClasses) {
    this.numClasses = numClasses;
  }

  /**
   * Adds an example to the controller dataset.
   * @param {Tensor} example A tensor representing the example. It can be an image,
   *     an activation, or any other type of Tensor.
   * @param {number} label The label of the example. Should be an umber.
   */
  addExample(example, label) {
    // One-hot encode the label.
    const y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]), this.numClasses));

    if (this.xs == null) {
      // For the first example that gets added, keep example and y so that the
      // ControllerDataset owns the memory of the inputs. This makes sure that
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
const NUM_CLASSES = 2;

// A webcam class that generates Tensors from the images from the webcam.
webcam = new Webcam(getVideoFrames());

// The dataset object where we will store activations.
const controllerDataset = new ControllerDataset(NUM_CLASSES);

var mobilenet;
let model;

// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
function loadMobilenet() {
  
  return new Promise(resolve => {
    
  tf.loadModel(
      'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json').then(function(r){
    
    console.log(r,r.getLayer('conv_pw_13_relu'));
    
     mobilenet = r;

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer('conv_pw_13_relu');
  console.log(mobilenet.layers);
  resolve(tf.model({inputs: mobilenet.inputs, outputs: layer.output}));
  
  
  })
   
  });
}

// When the UI buttons are pressed, read a frame from the webcam and associate
// it with the class label given by the button. up, down, left, right are
// labels 0, 1, 2, 3 respectively.
function setExampleHandler(label) {
  tf.tidy(() => {
    webcam = new Webcam(getVideoFrames());
    const img = webcam.capture();
    controllerDataset.addExample(mobilenet.predict(img), label);
  });
}

async function train() {
  if (controllerDataset.xs == null) {
    throw new Error('Add some examples before training!');
  }

  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten({inputShape: [7, 7, 256]}),
      // Layer 1
      tf.layers.dense({
        units: 100,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      // Layer 2. The number of units of the last layer should correspond
      // to the number of classes we want to predict.
      tf.layers.dense({
        units: NUM_CLASSES,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ]
  });

  // Creates the optimizers which drives training of the model.
  const optimizer = tf.train.adam(0.001);
  // We use categoricalCrossentropy which is the loss function we use for
  // categorical classification which measures the error between our predicted
  // probability distribution over classes (probability that an input is of each
  // class), versus the label (100% probability in the true class)>
  model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends on how many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize =
      Math.floor(controllerDataset.xs.shape[0] * 1);
  if (!(batchSize > 0)) {
    throw new Error(
        `Batch size is 0 or NaN. Please choose a non-zero fraction.`);
  }

  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
  model.fit(controllerDataset.xs, controllerDataset.ys, {
    batchSize,
    epochs: 100,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        console.log('Loss: ' + logs.loss.toFixed(5));
        await tf.nextFrame();
      }
    }
  });
}


let Predicting = false;

async function predict() {
  while (Predicting) {
    const predictedClass = tf.tidy(() => {

      // Capture the frame from the webcam.
      webcam = new Webcam(getVideoFrames());
      const img = webcam.capture();

      // Make a prediction through mobilenet, getting the internal activation of
      // the mobilenet model.
      const activation = mobilenet.predict(img);

      // Make a prediction through our newly-trained model using the activation
      // from mobilenet as input.
      const predictions = model.predict(activation);

      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      return predictions.as1D().argMax();
    });

    const classId = (await predictedClass.data())[0];

    console.log(classId);
    inference(classId);
    await tf.nextFrame();
  }
  
}


//Custome function for muting youtube videos,
// you feed it class id predicted by the model.

function inference(classId){
    var btn =  document.getElementsByClassName('ytp-mute-button')[0];

    if (classId == 1 && btn.title == 'Unmute') {
      document.getElementsByClassName('ytp-mute-button')[0].click()
    }else if (classId == 0 && btn.title == 'Mute'){
      document.getElementsByClassName('ytp-mute-button')[0].click()
    }
}
  

async function init() {
 // mobilenet = await loadMobilenet();

  // Warm up the model. This uploads weights to the GPU and compiles the WebGL
  // programs so the first time we collect data from the webcam it will be
  // quick.
 // tf.tidy(() => mobilenet.predict(webcam.capture()));
 
 loadMobilenet().then(function(e){

var f=e.predict(new Webcam(getVideoFrames()).capture());
    const topK = mobilenet.getTopKClasses(f, 5);
    for (const key in topK) {
      resultElement.innerText += `${topK[key].toFixed(5)}: ${key}\n`;
    };

})
}




