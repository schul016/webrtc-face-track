/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

"use strict"

const setWindowVariable = window.setWindowVariable = (key, value) => {
    window[key] = value;
}

const UPDATE_FACE_DETECT_EVERY_N_FRAMES = 30
const TARGET_HEIGHT = 160
const FACE_RECOGNITION_BOX_EXPANSION_FACTOR = 2

let counter = window.counter = 0

// Put variables in global scope to make them available to the browser console.
const video = document.querySelector("video")
const canvas = window.canvas = document.querySelector("canvas")
canvas.width = 480
canvas.height = 360
const ctx = window.ctx = canvas.getContext("2d")

video.addEventListener("loadeddata", async () => {
    const model = window.model = await blazeface.load()
    let predictions = window.predictions = null
    requestAnimationFrame(canvasDraw)
    // video.requestVideoFrameCallback(canvasDraw)
})

const canvasDraw = async () => {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    if (predictions && predictions.length) {
        for (let i = 0; i < predictions.length; i++) {
            const start = predictions[i].topLeft
            const end = predictions[i].bottomRight
            const size = [end[0] - start[0], end[1] - start[1]]
            const center = [start[0] + size[0]/2, start[1] + size[1]/2]
            const targetHeight = window.TargetHeight || TARGET_HEIGHT
            const targetSize = [0.75*targetHeight, targetHeight]
            const targetCenter = [(canvas.width - targetSize[0])/2, (canvas.height - targetSize[1])/2]
            const d = size[0] > size[1] ? size[0] : size[1]
            const faceRecBoxExpFactor = window.FaceRecBoxExpFactor || FACE_RECOGNITION_BOX_EXPANSION_FACTOR
            ctx.drawImage(video, parseInt(center[0] - 0.375 * faceRecBoxExpFactor * d), parseInt(center[1] - 0.5 * faceRecBoxExpFactor * d), parseInt(0.75 * faceRecBoxExpFactor * d), parseInt(faceRecBoxExpFactor * d), targetCenter[0], targetCenter[1], targetSize[0], targetSize[1])
        }
    }
    let updateFaceDectectEveryNFrames = parseInt(window.FramesPerFR) || UPDATE_FACE_DETECT_EVERY_N_FRAMES
    if (counter % updateFaceDectectEveryNFrames == 0) {
        counter = 1
        predictions = await model.estimateFaces(video)
    }
    counter++
    requestAnimationFrame(canvasDraw)
    // video.requestVideoFrameCallback(canvasDraw)
}

const constraints = {
    audio: false,
    video: true
}

async function handleSuccess(stream) {
    window.stream = stream // make stream available to browser console
    video.srcObject = stream
}

function handleError(error) {
    console.log("navigator.MediaDevices.getUserMedia error: ", error.message, error.name)
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError)