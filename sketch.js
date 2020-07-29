const posesCollection = [
  [],
  []
]
let complete = false
const posesCollector = (filename) => {
  return (sketch) => {
    const index = filename === "PoseNetTest1A.mp4" ? 0 : 1
    var video;
    var videofile = filename
    let poseNet;
    let playing = false

    sketch.setup = () => {
      sketch.noCanvas()
      video = sketch.createVideo(videofile, sketch.onLoad);

      //Posenet
      poseNet = ml5.poseNet(video, sketch.modelReady);
      poseNet.on('pose', sketch.savePoses);
      video.hide();
    }

    sketch.onLoad = () => {
      video.size(100, 100);
      video.volume(0)
      video.onended(function() {
        playing = false
        if (index === 1)
        {
          complete = true
          console.log(posesCollection)
        }
      })
      video.addCue(0.0, function() {
        playing = true
      })
      video.addCue(0.01, function() {
        playing = true
      })
      video.speed(0.5)
      video.play()
    }

    sketch.modelReady = () => {
      poseNet.singlePose()
    }

    //Pose Net 
    sketch.savePoses = (poses) => {
      if (playing) {
        posesCollection[index].push({
          time: video.time(),
          poses: poses[0].pose.keypoints
            .map(item => item.position)
        })
      }
    }

  }
}

let myp5 = new p5(
  posesCollector('PoseNetTest1A.mp4')
);
let myp52 = new p5(
  posesCollector('PoseNetTest1B.mp4')
);



const sketchCreator = (filename) => {
  return (sketch) => {
    var video;
    var videofile = filename;
    let poseNet;
    let poses = [];
    let skeletons = [];
    const index = filename === "PoseNetTest1A.mp4" ? 0 : 1

    sketch.setup = () => {
      sketch.createCanvas(400, 400);
      video = sketch.createVideo(videofile, sketch.onLoad);
      video.hide();
    }

    sketch.onLoad = () => { 
      video.size(400, 400);
      video.volume(0)
      video.speed(0.25)
      video.play()
      video.addCue(0.0, function() {})
      posesCollection[index].forEach(pose => {
        video.addCue(pose.time, function() {sketch.drawKeypoints(pose.poses)})
      })
    }


    sketch.draw = () => {
      sketch.image(video, 0, 0, sketch.width, sketch.height);
    }

    sketch.drawKeypoints = (keypoints) => {

      for (let j = 0; j < keypoints.length; j++) {        
        let keypoint = keypoints[j];
        sketch.fill(255, 0, 0);
        sketch.noStroke();
        sketch.ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

let myp5Complete
let myp5Complete2
if (complete)
{
  console.log("company entered")
  myp5Complete = new p5(
  sketchCreator('PoseNetTest1A.mp4'), 
  document.getElementById('p5sketch')
  );
  
  myp5Complete2 = new p5( 
    sketchCreator('PoseNetTest1B.mp4'),
    document.getElementById('p5sketch2')
  );
}
