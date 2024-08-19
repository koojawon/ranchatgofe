<template>
  <div class="login">
    <div class="container" id="container">
      <div class="form-container sign-up-container">
        <form action="#">
          <h1>회원가입하기!</h1>
          <!-- <div class="social-container">
            <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social"><i class="fab fa-google-plus-g"></i></a>
          </div> -->
          <span>이메일로 회원가입</span>
            <input type="text" id="signUpNickname" placeholder="사용할 이름"/>
            <input type="email" id="signUpEmail" placeholder="이메일"/>
            <input type="password" id="signUpPw" placeholder="비밀번호"/>
            <button @click="submitSignUp">Sign Up</button>
        </form>
      </div>
    <div class="form-container sign-in-container">
      <form action="#">
        <h1>로그인하기</h1>
        <!-- <div class="social-container">
          <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="social"><i class="fab fa-google-plus-g"></i></a>
        </div> -->
        <div id="reason" class="failReason"></div>
        <input type="email" id="userEmail" placeholder="이메일"/>
        <input type="password" id="userPw" placeholder="비밀번호"/>
        <a href="#">비밀번호를 잊어버렸나요?</a>
        <button @click="submitLogin">로그인!</button>
      </form>
      
    </div>
      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel overlay-left">
            <h1>랜챗할 준비!</h1>
            <p>로그인하고 바로 랜챗할 준비하기!</p>
            <button class="ghost" id="signIn" @click="deactivateRight">로그인</button>
          </div>
          <div class="overlay-panel overlay-right">
            <h1>처음이신가요!</h1>
            <p>간단한 회원가입으로 시작해 보세요!</p>
            <button class="ghost" id="signUp" @click="activateRight">회원가입하기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'LoginComponent',
    methods: {
      activateRight: () => {
          document.getElementById('container').classList.add("right-panel-active");        
      },
      deactivateRight: () => {
          document.getElementById('container').classList.remove("right-panel-active");        
      },
      submitLogin() {
        var email = document.getElementById('userEmail').value;
        var pw = document.getElementById('userPw').value;
        var data = {
          username: email,
          password: pw
        }
        this.$axios
          .post('api/login', data, {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true
          })
          .then((response) => {
            this.$store.commit('setAccessToken', response.headers["authorization"]);
            this.$router.push("/")            
          })
          .catch((reason) => {
            console.log(reason);
            let reasonBox = document.getElementById("reason");
            reasonBox.innerText = reason.response.data.message;
            reasonBox.classList.remove("fadeOut");
            reasonBox.offsetWidth;
            reasonBox.classList.add("fadeOut");
          })
      },
      submitSignUp() {
        let email = document.getElementById("signUpEmail").value;
        let nickname = document.getElementById("signUpNickname").value;
        let pw = document.getElementById("signUpPw").value;
        let data = {
          username: email,
          password: pw,
          nickname: nickname
        }
        
        this.$axios
          .post("/api/signup", data, {
            headers: {
              "Content-Type": "application/json",
            }
          })
          .then((response) => {
            this.$store.commit('setMemberInfo', response.data.data);
            this.deactivateRight();
          })
          .catch((reason) => {
          console.log(reason);
        })      
      }
        
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');

* {
  box-sizing: border-box;
}

.login {
  background: #f6f5f7;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
  height: 100vh;
  margin: 0 0;
}

.failReason {
  display: flex;
  height: 25px;
  width: 100%;
  font-size: 12px;
  justify-content:left;
  align-items: end;
  color: red;
}

.fadeOut {
  animation: fadeOut 3.5s ease-out forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  95%{
    opacity: 0.9;
  }
  100%{
    opacity: 0;
  }
}

h1 {
  font-weight: bold;
  margin: 0;
}

h2 {
  text-align: center;
}

p {
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
}

span {
  font-size: 12px;
}

a {
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
}

button {
  border-radius: 20px;
  border: 1px solid #FF4B2B;
  background-color: #FF4B2B;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
}

button:active {
  transform: scale(0.95);
}

button:focus {
  outline: none;
}

button.ghost {
  background-color: transparent;
  border-color: #FFFFFF;
}

form {
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
}

input {
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
}

.container {
  background-color: #fff;
  border-radius: 10px;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 
      0 10px 10px rgba(0,0,0,0.22);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

.container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

@keyframes show {
  0%, 49.99% {
    opacity: 0;
    z-index: 1;
  }
  
  50%, 100% {
    opacity: 1;
    z-index: 5;
  }
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.container.right-panel-active .overlay-container{
  transform: translateX(-100%);
}

.overlay {
  background: #FF416C;
  background: -webkit-linear-gradient(to right, #FF4B2B, #FF416C);
  background: linear-gradient(to right, #FF4B2B, #FF416C);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #FFFFFF;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
    transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
    transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.overlay-left {
  transform: translateX(-20%);
}

.container.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.container.right-panel-active .overlay-right {
  transform: translateX(20%);
}

.social-container {
  margin: 20px 0;
}

.social-container a {
  border: 1px solid #DDDDDD;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  height: 40px;
  width: 40px;
}

footer {
    background-color: #222;
    color: #fff;
    font-size: 14px;
    bottom: 0;
    position: fixed;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 999;
}

footer p {
    margin: 10px 0;
}

footer i {
    color: red;
}

footer a {
    color: #3c97bf;
    text-decoration: none;
}
</style>
