var model;
// model is a global variable

async function loadModel() {
  model = await tf.loadGraphModel('TFJS/model.json')
}

function normalize(item) {
  return item / 255.0;
}

function predictImage() {
  // Load the Image
  let image = cv.imread(canvas);

  // Testing Only (delete later)
  // display the image captured in a separate canvas
  // const outputCanvas = document.createElement('CANVAS');
  // cv.imshow(outputCanvas, image);
  // document.body.appendChild(outputCanvas);

  // Convert to Black&White
  cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);

  // Increase the contrast.  anything above 175 (grey) goes to 255 (white)
  cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

  //Identify the contours
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

  //Calculate the bounding rectangle
  let cnt = contours.get(0);
  let rect = cv.boundingRect(cnt);

  //Crop the image
  image = image.roi(rect);

  // Resizing/Rescaling the Image
  // To simulate MNIST, we want 20x20 image.  To maintain scale, we have to
  // resize proportionally.  So if original image has height > width, we need
  // to calculate a scaling factor.

  var height = image.rows;
  var width = image.cols;

  if (height > width) {
    height = 20;
    const scalingFactor = image.rows / height;
    width = Math.round(image.cols / scalingFactor);
  }
  else {
    width = 20;
    const scalingFactor = image.cols / width;
    height = Math.round(image.rows / scalingFactor);
  }

  let newSize = new cv.Size(width, height);

  cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA);

  // Add Padding i.e. the 4 pixels on each side plus any shortfall from the Rescaling
  // LEFT PADDING = 4 + (20 - width) / 2
  // TOP PADDING = 4 + (20 - height) / 2
  // To ensure correct padding, we'll round up (ceil) and down (floor) on opposite sides

  const LEFT = Math.ceil(4 + (20 - width) / 2);
  const RIGHT = Math.floor(4 + (20 - width) / 2);
  const TOP = Math.ceil(4 + (20 - height) / 2);
  const BOTTOM = Math.floor(4 + (20 - height) / 2);
  // black border
  const BLACK = new cv.Scalar(0, 0, 0, 0);
  cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);

  // Find the Centre of Mass (Centroid)
  cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  cnt = contours.get(0);
  const MOMENTS = cv.moments(cnt, false);
  const CX = MOMENTS.m10/MOMENTS.m00;
  const CY = MOMENTS.m01/MOMENTS.m00;

  // Shift the image so that the center of mass is in the center of the Image
  // midpint is 14 as the full image is 28x28
  const X_SHIFT = Math.round(image.cols/2.0 - CX);
  const Y_SHIFT = Math.round(image.rows/2.0 - CY);

  newSize = new cv.Size(image.cols, image.rows);
  const M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
  cv.warpAffine(image, image, M, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

  // Normalize the pixel values i.e. divide by 255
  // calls the 'normalize' function above
  let pixelValues = image.data;
  // Ensure that we have a floating point value instead of integers
  pixelValues = Float32Array.from(pixelValues);
  pixelValues = pixelValues.map(normalize);

  // Create our Tensor
  const X = tf.tensor([pixelValues]);
  // console.log('Shape of Tensor: ', X.shape);
  // console.log('dtype of Tensor: ', X.dtype);

  // Make Prediction
  const result = model.predict(X);
  // result.print();

  // get the data from the Tensor and return the first element
  const output = result.dataSync()[0];

  // Cleanup
  image.delete();
  contours.delete();
  cnt.delete();
  hierarchy.delete();
  M.delete();
  // tensor Cleanup
  X.dispose();
  result.dispose();

  // return the value from the predict tensor
  return output;
}
