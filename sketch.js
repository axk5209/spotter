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
					posesCollection[0].forEach(element => {
						element.time = Math.round(element.time * 4) / 4
					})
					posesCollection[1].forEach(element => {
						element.time = Math.round(element.time * 4) / 4
					})

					let start = Math.max(posesCollection[0][0].time, posesCollection[1][0].time)
					let end = Math.min(posesCollection[0][posesCollection[0].length-1].time,posesCollection[0][posesCollection[0].length-1].time)
					let offset = start / 0.25 - 1
					console.log(start)
					console.log(end)
					console.log(offset)

					let polished1 = []
					let polished2 = []
					posesCollection[0].forEach(element => {
						if (element.time <= end)
						{
							let index = element.time/0.25 - offset
							polished1[index] = element
						}
					})
					posesCollection[1].forEach(element => {
						if (element.time <= end)
						{
							let index = element.time/0.25 - offset
							polished2[index] = element
						}
					})

					
					console.log(polished1)
					console.log(polished2)
					for (let i = 0; i < polished1.length; i++)
					{
						if (!polished1[i] || !polished2[i])
						{
							polishedCollection[0].push({time: i*0.25, skeleton: [], poses: []})
							polishedCollection[1].push({time: i*0.25, skeleton: [], poses: []})
							continue
						}


						let vector1 = polished1[i].poses.map(item => [item.x, item.y]).flatten()
						let vector2 = polished2[i].poses.map(item => [item.x, item.y]).flatten()
						let distance = sketch.distance(vector1, vector2)
						if (distance < 0.02)
						{
							polished1[polished1.length-1] = {time: end+0.25, skeleton: [], poses: []}
							polished2[polished2.length-1] = {time: end+0.25, skeleton: [], poses: []}
						}
						else
						{
							polishedCollection[0].push({
								time: polished1[i].time,
								poses: polished1[i].poses,
								skeleton: polished1[i].skeleton
							})
							polishedCollection[1].push({
								time: polished2[i].time,
								poses: polished2[i].poses,
								skeleton: polished2[i].skeleton
							})
						}
							
					}
					polishedCollection[0].push({time: end+0.25, skeleton: [], poses: []})
					polishedCollection[1].push({time: end+0.25, skeleton: [], poses: []})
					console.log(polishedCollection)
					document.getElementById("message").style.display = "none"
					const viewButton = document.getElementById("view")
					viewButton.style.background = "#1abc9c";
					viewButton.style.color = "white";
					viewButton.disabled = false
				}
			})
			video.addCue(0.0, function () {
				playing = true
			})
			video.addCue(0.01, function () {
				playing = true
			})
			video.speed(0.5)
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
	document.getElementById("message").style.display = "block"
	const spotButton = document.getElementById("spot")
	spotButton.style.background = "white";
	spotButton.style.color = "gray";
	spotButton.disabled = true
	const video1 = document.getElementById("file-1").files[0]
	const reader1 = new FileReader()
	reader1.readAsDataURL(video1)
	reader1.onloadend = () => {
		let myp5 = new p5(
			posesCollector(reader1.result, 0)
		);
	}

	const video2 = document.getElementById("file-2").files[0]
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
	document.getElementById("message").style.display = "none"
	const viewButton = document.getElementById("view")
	viewButton.style.background = "white";
	viewButton.style.color = "gray";
	viewButton.disabled = true
	const video1 = document.getElementById("file-1").files[0]
	const reader1 = new FileReader()
	reader1.readAsDataURL(video1)
	reader1.onloadend = () => {
		let myp5Complete = new p5(
			sketchCreator(reader1.result, 0),
			document.getElementById('p5sketch')
		);
	}

	const video2 = document.getElementById("file-2").files[0]
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
			video.speed(0.25)
			video.play()
			video.addCue(0.0, function () { })
			video.onended(function () {
				keypoints = []
				skeleton = []
			})
			polishedCollection[index].forEach(pose => {
				video.addCue(pose.time, function () {
						keypoints = pose.poses
						skeleton = pose.skeleton
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

// const spotButton = document.getElementById("spot")
// const viewButton = document.getElementById("button")

// spotButton.disabled = true
// viewButton.disabled = true
function onInputChange()
{
	if (document.getElementById("file-1").value && document.getElementById("file-2").value)
	{
		const spotButton = document.getElementById("spot")
		spotButton.style.background = "#1abc9c";
		spotButton.style.color = "white";
		spotButton.disabled = false
	}
}