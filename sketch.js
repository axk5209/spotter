const posesCollection = [
	[],
	[]
]
const polishedCollection = [
	[],
	[]
]
let complete = false
const posesCollector = (filename, index) => {
	return (sketch) => {
		var video;
		var videofile = filename
		let poseNet;
		let playing = false

		sketch.setup = () => {
			sketch.noCanvas()
			video = sketch.createVideo(videofile, sketch.onLoad);
			poseNet = ml5.poseNet(video, sketch.modelCreated);
			poseNet.on('pose', sketch.savePoses);
			video.hide();
		}

		sketch.onLoad = () => {
			video.size(400, 400);
			video.volume(0)
			video.onended(function () {
				playing = false
				if (index === 1) {
					complete = true

					let polished1 = posesCollection[0]
					let polished2 = posesCollection[1]
					let minLength = posesCollection[0].length
					if (posesCollection[0].length < posesCollection[1].length) {
						polished2 = posesCollection[1].slice(0, posesCollection[0].length)
					}
					if (posesCollection[0].length > posesCollection[1].length) {
						polished1 = posesCollection[0].slice(0, posesCollection[1].length)
						minLength = posesCollection[1].length
					}
					console.log(polished1.length)
					for (let i = 0; i < minLength; i++) {
						let vector1 = polished1[i].poses.map(item => [item.x, item.y]).flatten()
						let vector2 = polished2[i].poses.map(item => [item.x, item.y]).flatten()
						let distance = sketch.distance(vector1, vector2)

						polishedCollection[0].push({
							distance,
							time: polished1[i].time,
							poses: polished1[i].poses,
							skeleton: polished1[i].skeleton
						})
						polishedCollection[1].push({
							distance,
							time: polished2[i].time,
							poses: polished2[i].poses,
							skeleton: polished2[i].skeleton
						})

					}
					console.log(polishedCollection)
					//           console.log(polished1)
					//           console.log(polished2)
					//           let vector1 = posesCollection[0][0].poses.map(item => [item.x, item.y]).flatten()
					//           let vector2 = posesCollection[1][0].poses.map(item => [item.x, item.y]).flatten()
					//             console.log(vector1)
					//             console.log(vector2)

					//           console.log(sketch.cosineSim(vector1, vector2))
					//           console.log(sketch.distance(vector1, vector2))

				}
			})
			video.addCue(0.0, function () {
				playing = true
			})
			video.addCue(0.01, function () {
				playing = true
			})
			video.speed(0.1)
			video.play()
		}

		sketch.modelCreated = () => {
			poseNet.singlePose()
		}
		//Pose Net 
		sketch.savePoses = (poses) => {
			if (playing) {
				//console.log(poses)
				posesCollection[index].push({
					time: video.time(),
					poses: poses[0].pose.keypoints.map(item => ({
						score: item.score,
						x: item.position.x,
						y: item.position.y
					})),
					skeleton: poses[0].skeleton.map(pair =>
						pair.map(part => ({
							score: part.score,
							x: part.position.x,
							y: part.position.y
						}))
					)
				})
			}
		}

		sketch.cosineSim = (A, B) => {
			let dotproduct = 0;
			let mA = 0;
			let mB = 0;
			for (i = 0; i < A.length; i++) { // here you missed the i++
				dotproduct += (A[i] * B[i]);
				mA += (A[i] * A[i]);
				mB += (B[i] * B[i]);
			}
			mA = Math.sqrt(mA);
			mB = Math.sqrt(mB);
			let similarity = (dotproduct) / ((mA) * (mB)) // here you needed extra brackets
			return similarity;
		}

		sketch.distance = (A, B) => {
			let dotproduct = 0;
			let mA = 0;
			let mB = 0;
			for (i = 0; i < A.length; i++) { // here you missed the i++
				dotproduct += (A[i] * B[i]);
				mA += (A[i] * A[i]);
				mB += (B[i] * B[i]);
			}
			mA = Math.sqrt(mA);
			mB = Math.sqrt(mB);
			let similarity = (dotproduct) / ((mA) * (mB)) // here you needed extra brackets
			let distance = 2 * (1 - similarity);
			return Math.sqrt(distance);
		}
	}
}
function handleSpot() {
	console.log("spot handled")
	const video1 = document.getElementById("video1").files[0]
	const reader1 = new FileReader()
	reader1.readAsDataURL(video1)
	reader1.onloadend = () => {
		let myp5 = new p5(
			posesCollector(reader1.result, 0)
		);
	}

	const video2 = document.getElementById("video2").files[0]
	const reader2 = new FileReader()
	reader2.readAsDataURL(video2)
	reader2.onloadend = () => {
		let myp52 = new p5(
			posesCollector(reader2.result, 1)
		);
	}
}

function handleView() {
	document.getElementById('video-container').style.display = "flex"
	console.log("spot handled")
	const video1 = document.getElementById("video1").files[0]
	const reader1 = new FileReader()
	reader1.readAsDataURL(video1)
	reader1.onloadend = () => {
		let myp5Complete = new p5(
			sketchCreator(reader1.result, 0),
			document.getElementById('p5sketch')
		);
	}

	const video2 = document.getElementById("video2").files[0]
	const reader2 = new FileReader()
	reader2.readAsDataURL(video2)
	reader2.onloadend = () => {
		let myp5Complete = new p5(
			sketchCreator(reader2.result, 1),
			document.getElementById('p5sketch2')
		);
	}


}


const sketchCreator = (filename, index) => {
	return (sketch) => {
		var video;
		var videofile = filename;
		let poseNet;
		let keypoints = [];
		let skeleton = [];

		sketch.setup = () => {
			sketch.createCanvas(400, 400);
			video = sketch.createVideo(videofile, sketch.onLoad);
			video.hide();
		}

		sketch.onLoad = () => {
			video.size(400, 400);
			video.volume(0)
			video.speed(0.1)
			video.play()
			video.addCue(0.0, function () { })
			polishedCollection[index].forEach(pose => {
				video.addCue(pose.time, function () {
					if (pose.distance > 0.04) {
						keypoints = pose.poses
						skeleton = pose.skeleton
					}
					else {
						keypoints = []
						skeleton = []
					}
				})
			})
		}


		sketch.draw = () => {
			sketch.image(video, 0, 0, sketch.width, sketch.height);
			//console.log(video.time())
			//console.log(keypoints)
			sketch.drawKeypoints()
			sketch.drawSkeleton()
		}

		sketch.drawKeypoints = () => {
			for (let j = 0; j < keypoints.length; j++) {
				let keypoint = keypoints[j];
				if (keypoint.score > 0.1) {
					sketch.fill(255, 0, 0);
					sketch.noStroke();
					sketch.ellipse(keypoint.x, keypoint.y, 10, 10);
				}
			}
		}
		sketch.drawSkeleton = () => {
			// Loop through all the skeletons detected
			for (let j = 0; j < skeleton.length; j++) {
				let partA = skeleton[j][0];
				let partB = skeleton[j][1];
				sketch.stroke(255, 0, 0);
				sketch.line(partA.x, partA.y, partB.x, partB.y);
			}
		}
	}
}