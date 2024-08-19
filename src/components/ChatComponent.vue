<template>
  <div class="container">
    <div class="row">
      <div class="page-header">
        <h1>실시간 화상 랜덤 채팅!!</h1>
      </div>
    </div>
    <div class="row" id="mainRow">
      <div class="col">
        <div class="row">
          <div class="col-md-10" id="videoSmall">
            <video autoplay height="180px" id="myVideo" width="240px"></video>
          </div>
          <div class="col">
            <button
              class="btn btn-success mx-2"
              id="start"
              @click="start"
              v-bind:disabled="ready === false"
            >
              <i class="bi bi-play-fill"></i>
              시작하기!
            </button>
            <button
              class="btn btn-danger"
              id="stop"
              @click="stop"
              v-bind:disabled="ready === true"
            >
              <i class="bi bi-stop-fill"></i>
              멈추기!
            </button>
          </div>
        </div>
        <div class="row" style="padding-top: 20px">
          <div class="col" id="videoBig">
            <video autoplay height="480px" id="video" width="640px"></video>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="right">
          <div class="chat" id="chatBox">
            <div class="sysMessage">
              <span>test</span>
            </div>
            <div class="bubble you">hi</div>
          </div>
          <div class="write">
            <input autocomplete="off" id="inputBox" type="text" />
            <i class="bi bi-send send" id="sendButton"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WebRtcPeer from "@/libs/WebRTC";

export default {
  name: "ChatComponent",
  methods: {
    sendChat() {
      var text = this.inputBox.value.trim();
      if (text) {
        var newBubble = document.createElement("div");
        newBubble.className += "bubble me";
        newBubble.textContent = text;
        this.chatBox.appendChild(newBubble);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
        this.inputBox.value = "";
        this.webRtcPeer.send(text);
      }
    },
    enterKey(e) {
      if (e.key === "Enter") this.sendChat();
    },
    recalcChatBoxHeight() {
      this.chatBox.style.maxHeight =
        document.getElementById("mainRow").clientHeight - 48 + "px";
    },
    initWs() {
      this.ws.onmessage = (message) => {
        var parsedMessage = JSON.parse(message.data);
        switch (parsedMessage.id) {
          case "sdpgenorder":
            this.clearChat();
            this.appendSysMessage("매칭되었습니다!");
            this.generateOffer();
            break;
          case "sdpOffer":
            this.clearChat();
            this.appendSysMessage("매칭되었습니다!");
            this.handleOffer(parsedMessage);
            break;
          case "sdpAnswer":
            this.handleAnswer(parsedMessage);
            break;
          case "onIceCandidate":
            this.webRtcPeer.addIceCandidate(
              parsedMessage.candidate,
              (error) => {
                if (error)
                  return console.log("Error adding candidate: " + error);
              }
            );
            break;
          case "stop":
            this.appendSysMessage("상대방과 연결이 끊어졌습니다.");
            this.dispose();
            break;
          default:
            console.log("Unrecognized message : " + parsedMessage);
        }
      };
    },
    generateOffer() {
      this.webRtcPeer = new WebRtcPeer(
        {
          myVideo: this.myVideo,
          oppoVideo: this.oppoVideo,
          onIceCandidate: this.onIceCandidate,
          dataChannelOpen: this.dataChannelOpen,
          dataChannelClose: this.dataChannelClose,
          dataChannelError: this.dataChannelError,
          dataChannelMessage: this.dataChannelMessage,
          sendFunction: this.sendMessage,
        },
        (error) => {
          if (error) {
            console.log(error);
            this.dispose();
            return;
          }
          this.webRtcPeer.generateOffer((offer) => {
            var message = {
              id: "sdpOffer",
              sdpOffer: offer,
            };
            this.sendMessage(message);
          });
        }
      );
    },
    clearChat() {
      if (this.chatBox.childNodes) this.chatBox.replaceChildren();
    },
    stop() {
      this.appendSysMessage("연결을 종료했습니다.");
      var message = {
        id: "stop",
      };
      this.sendMessage(message);
      this.dispose();
    },
    onIceCandidate(candidate) {
      var message = {
        id: "onIceCandidate",
        candidate: candidate,
      };
      this.sendMessage(message);
    },

    appendSysMessage(str) {
      var newBubble = document.createElement("div");
      var inSpan = document.createElement("span");
      var text = document.createTextNode(str);
      inSpan.appendChild(text);
      newBubble.className += "sysMessage";
      newBubble.appendChild(inSpan);
      this.chatBox.appendChild(newBubble);
    },
    handleOffer(message) {
      this.webRtcPeer = new WebRtcPeer(
        {
          myVideo: this.myVideo,
          oppoVideo: this.oppoVideo,
          onIceCandidate: this.onIceCandidate,
          dataChannelOpen: this.dataChannelOpen,
          dataChannelClose: this.dataChannelClose,
          dataChannelError: this.dataChannelError,
          dataChannelMessage: this.dataChannelMessage,
          sendFunction: this.sendMessage,
        },
        (error) => {
          if (error) {
            console.log(error);
            return;
          }
          this.webRtcPeer.processOffer(
            message.sdpOffer,
            this.sendMessage,
            (e) => {
              if (e) return console.log(e);
            }
          );
        }
      );
      this.$data.ready = false;
    },
    handleAnswer(message) {
      this.webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
        if (error) return console.log(error);
      });
    },
    dispose() {
      if (this.webRtcPeer) {
        this.webRtcPeer.dispose();
        this.webRtcPeer = null;
      }
      this.$data.ready = true;
    },
    dataChannelOpen() {
      this.inputBox.disabled = false;
      this.sendButton.addEventListener("click", this.sendChat);
    },

    dataChannelClose() {
      this.inputBox.disabled = true;
      this.sendButton.removeEventListener("click", this.sendChat);
    },

    dataChannelMessage(e) {
      var data = e.data;
      var newBubble = document.createElement("div");
      var textNode = document.createTextNode(data);
      newBubble.className += "bubble you";
      newBubble.appendChild(textNode);
      this.chatBox.appendChild(newBubble);
      this.chatBox.scrollTop = this.chatBox.scrollHeight;
    },

    sendMessage(message) {
      this.ws.send(JSON.stringify(message));
    },

    dataChannelError(e) {
      console.error(e);
    },

    start() {
      var startMessage = {
        id: "start",
      };
      this.sendMessage(startMessage);
      this.$data.ready = false;
    },

    getReadyState() {
      return this.$data.ready;
    },
  },
  mounted() {
    this.inputBox = document.getElementById("inputBox");
    this.oppoVideo = document.getElementById("video");
    this.myVideo = document.getElementById("myVideo");
    this.sendButton = document.getElementById("sendButton");
    this.chatBox = document.getElementById("chatBox");
    this.inputBox.addEventListener("keyup", this.enterKey);
    this.ws = new WebSocket("ws://localhost:8082/ranChat");
    this.webRtcPeer;
    this.$data.ready = true;
    this.initWs();
    window.addEventListener("resize", this.recalcChatBoxHeight);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.recalcChatBoxHeight);
    this.ws.close();
  },
  data: function () {
    return {
      ready: true,
    };
  },
};
</script>

<style>
body {
  padding-top: 40px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  max-height: 50%;
  font-family: "Source Sans Pro", sans-serif;
  font-weight: 400;
}

*,
*:before,
*:after {
  box-sizing: border-box;
}

video {
  display: block;
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -webkit-transition: border-color ease-in-out 0.15s,
    box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}

#videoBig {
  width: 640px;
  height: 480px;
  top: 0;
  left: 0;
  z-index: 1;
}

#videoSmall {
  width: 240px;
  height: 180px;
  top: 0px;
  left: 0;
  z-index: 10;
  margin-right: 5px;
}

#mainRow {
  padding-top: 10px;
  height: 80%;
}

.right {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chat {
  padding: 0 35px 30px;
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-color: #e6e6e6;
  justify-content: flex-end;
  height: calc(100% - 48px);
  -ms-overflow-style: none;
  scrollbar-width: none;
  overflow: auto;
}
.chat::-webkit-scrollbar {
  display: none;
}
.write {
  bottom: 29px;
  left: 30px;
  height: 42px;
  padding-left: 8px;
  border: 1px solid #e6e6e6;
  background-color: #eceff1;
  border-radius: 5px;
}
input {
  font-size: 16px;
  width: calc(100% - 40px);
  height: 40px;
  padding: 0 10px;
  color: #1a1a1a;
  border: 0;
  outline: none;
  background-color: #eceff1;
}
input.send {
  width: 30px;
  height: 42px;
  color: #1a1a1a;
  cursor: pointer;
}

.bubble {
  position: relative;
  font-size: 16px;
  clear: both;
  margin-bottom: 8px;
  padding: 13px 14px;
  vertical-align: middle;
  border-radius: 5px;
  transition-timing-function: cubic-bezier(0.4, -0.04, 1, 1);
  animation-duration: 0.15s;
}
.bubble:before {
  position: absolute;
  top: 19px;
  display: block;
  width: 8px;
  height: 6px;
  content: "\00a0";
  transform: rotate(29deg) skew(-35deg);
}
.bubble.you {
  float: left;
  color: #fff;
  background-color: #00b0ff;
  align-self: flex-start;
  animation-name: slideFromLeft;
}
.bubble.you:before {
  left: -3px;
  background-color: #00b0ff;
}

.bubble.me {
  float: right;
  color: #1a1a1a;
  background-color: #eceff1;
  align-self: flex-end;
  animation-name: slideFromRight;
}
.bubble.me:before {
  right: -3px;
  background-color: #eceff1;
}

.sysMessage {
  position: relative;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 27px;
  vertical-align: middle;
  text-align: center;
  display: inline-block;
}
.sysMessage span {
  font-size: 14px;
  color: #999;
}
.sysMessage span:before,
.sysMessage span:after {
  position: absolute;
  top: 10px;
  display: inline-block;
  width: 30%;
  height: 1px;
  content: "";
  background-color: #e6e6e6;
}
.sysMessage span:before {
  left: 0;
}
.sysMessage span:after {
  right: 0;
}

@keyframes slideFromLeft {
  0% {
    margin-left: -200px;
    opacity: 0;
  }
  100% {
    margin-left: 0;
    opacity: 1;
  }
}
@-webkit-keyframes slideFromLeft {
  0% {
    margin-left: -200px;
    opacity: 0;
  }
  100% {
    margin-left: 0;
    opacity: 1;
  }
}
@keyframes slideFromRight {
  0% {
    margin-right: -200px;
    opacity: 0;
  }
  100% {
    margin-right: 0;
    opacity: 1;
  }
}
@-webkit-keyframes slideFromRight {
  0% {
    margin-right: -200px;
    opacity: 0;
  }
  100% {
    margin-right: 0;
    opacity: 1;
  }
}
</style>