const MEDIA_CONSTRAINTS = {
	video: true,
	audio: true,
};

//webrtcpeer 선언
export default class WebRtcPeer {
	constructor(options, callback) {
		showSpinner(options.myVideo);
		showSpinner(options.oppoVideo);
		this.localVideo = options.myVideo;
		this.remoteVideo = options.oppoVideo;
		this.onIceCandidate = options.onIceCandidate;
		this.videoStream;
		this.isNegotiating = false;
		this.pc;
		var configuration = {
			iceServers: [
				{ urls: "stun:stun.l.google.com:19302" },
				{ urls: "stun:stun.l.google.com:5349" },
				{ urls: "stun:stun1.l.google.com:3478" },
				{ urls: "stun:stun1.l.google.com:5349" },
				{ urls: "stun:stun2.l.google.com:19302" },
				{ urls: "stun:stun2.l.google.com:5349" },
				{ urls: "stun:stun3.l.google.com:3478" },
				{ urls: "stun:stun3.l.google.com:5349" },
				{ urls: "stun:stun4.l.google.com:19302" },
				{ urls: "stun:stun4.l.google.com:5349" },
			],
		};
		this.candidatesQueueOut = [];
		this.candidategatheringdone = false;
		this.dataChannel;

		// Init PeerConnection

		this.pc = new RTCPeerConnection(configuration);
		var dcId = "ranchatData";
		this.dataChannel = this.pc.createDataChannel(dcId, {
			negotiated: true,
			id: 0,
		});
		this.dataChannel.onopen = options.dataChannelOpen || null;
		this.dataChannel.onclose = options.dataChannelClose || null;
		this.dataChannel.onmessage = options.dataChannelMessage || null;
		this.dataChannel.onbufferedamountlow = options.onbufferedamountlow || null;
		this.dataChannel.onerror = options.onerror || null;

		this.pc.onicecandidate = (event) => {
			var candidate = event.candidate;
			if (candidate) {
				this.onIceCandidate(candidate);
				this.candidategatheringdone = false;
			} else if (!this.candidategatheringdone) {
				this.candidategatheringdone = true;
			}
			if (!this.candidategatheringdone) {
				this.candidatesQueueOut.push(candidate);
				if (!candidate) this.candidategatheringdone = true;
			}
		};

		this.pc.addEventListener("newListener", (event, listener) => {
			if (event === "icecandidate" || event === "this.candidategatheringdone") {
				while (this.candidatesQueueOut.length) {
					var candidate = this.candidatesQueueOut.shift();
					if (!candidate === (event === "this.candidategatheringdone")) {
						listener(candidate);
					}
				}
			}
		});

		this.iceCandidate = bufferizeCandidates(this.pc);

		navigator.mediaDevices
			.getUserMedia(MEDIA_CONSTRAINTS)
			.then((stream) => {
				this.videoStream = stream;
				this.start();
				callback();
			})
			.catch(callback);
	}

	addIceCandidate = (iceCandidate, callback) => {
		var candidate = new RTCIceCandidate(iceCandidate);
		this.iceCandidate(candidate, callback);
	};

	generateOffer = (callback) => {
		this.pc
			.createOffer()
			.then((offer) => {
				this.pc.setLocalDescription(offer);
				callback(offer);
			})
			.catch(callback);
	};

	setRemoteVideo() {
		if (this.remoteVideo) {
			this.remoteVideo.pause();
			var tempStream = new MediaStream();
			this.pc.getReceivers().forEach((sender) => {
				tempStream.addTrack(sender.track);
			});
			var stream = [tempStream][0];
			this.remoteVideo.srcObject = stream;
			this.remoteVideo.load();
		}
	}

	send = (data) => {
		if (this.dataChannel && this.dataChannel.readyState === "open") {
			this.dataChannel.send(data);
		} else {
			console.error(
				"Trying to send data over a non-existing or closed data channel"
			);
		}
	};

	processAnswer = (sdpAnswer, callback) => {
		var answer = new RTCSessionDescription(sdpAnswer);

		if (this.pc.signalingState === "closed") {
			return callback("PeerConnection is closed");
		}

		this.pc.setRemoteDescription(answer).then(() => {
			this.setRemoteVideo();
			this.isNegotiating = false;
			callback();
		}, callback);
	};

	processOffer = (sdpOffer, sendFunction, callback) => {
		var offer = new RTCSessionDescription(sdpOffer);
		if (this.pc.signalingState === "closed") {
			return callback("PeerConnection is closed");
		}

		this.pc
			.setRemoteDescription(offer)
			.then(() => {
				this.setRemoteVideo();
			})
			.then(() => {
				return this.pc.createAnswer();
			})
			.then((answer) => {
				var message = {
					id: "sdpAnswer",
					sdpAnswer: answer,
				};
				sendFunction(message);
				return this.pc.setLocalDescription(answer);
			})
			.then(() => {
				var localDescription = this.pc.localDescription;
				this.isNegotiating = false;
				callback(null, localDescription.sdp);
			})
			.catch(callback);
	};

	start(callback) {
		if (this.pc.signalingState === "closed") {
			callback(
				'The peer connection object is in "closed" state. This is most likely due to an invocation of the dispose method before accepting in the dialogue'
			);
		}

		if (this.videoStream && this.localVideo) {
			this.localVideo.srcObject = this.videoStream;
			this.localVideo.muted = true;
		}

		if (this.videoStream) {
			this.videoStream.getTracks().forEach((track) => {
				this.pc.addTrack(track, this.videoStream);
			});
		}
	}

	dispose = () => {
		if (this.localVideo) {
			this.localVideo.pause();
			this.localVideo.srcObject = null;
			this.localVideo.muted = false;
		}
		if (this.remoteVideo) {
			this.remoteVideo.pause();
			this.remoteVideo.srcObject = null;
		}
		if (this.dataChannel) {
			this.dataChannel.close();
		}
		if (this.pc) {
			this.pc.onicecandidate = null;
			this.pc.ontrack = null;
			this.pc.close();
			this.pc = null;
		}
		hideSpinner(this.localVideo, this.remoteVideo);
	};
}

function bufferizeCandidates(pc, onerror) {
	var candidatesQueue = [];
	pc.addEventListener("signalingstatechange", () => {
		if (pc.signalingState === "stable") {
			while (candidatesQueue.length) {
				var entry = candidatesQueue.shift();
				pc.addIceCandidate(entry.candidate, entry.callback, entry.callback);
			}
		}
	});

	return (candidate, callback) => {
		callback = callback || onerror;
		switch (pc.signalingState) {
			case "closed":
				callback(new Error("PeerConnection object is closed"));
				break;
			case "stable":
				if (pc.remoteDescription) {
					pc.addIceCandidate(candidate, callback, callback);
				}
				break;
			default:
				candidatesQueue.push({
					candidate: candidate,
					callback: callback,
				});
		}
	};
}

function showSpinner(...elements) {
	const style = 'center transparent url("./img/spinner.gif") no-repeat';
	elements.forEach((e) => (e.style.background = style));
}

function hideSpinner(...elements) {
	elements.forEach((e) => {
		e.src = "";
		e.poster = "";
		e.style.background = "";
	});
}
