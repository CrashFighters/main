import{login}from"/sdk/auth.js";import{sendPasswordResetEmail}from"/sdk/login.js";const emailInput=document.getElementById("emailInput");window.sendResetEmail=async()=>{if(""==emailInput.value)return Toastify({text:"Please enter your email address.",duration:3e3,gravity:"top",position:"center",backgroundColor:"#f44336"}).showToast();try{sendPasswordResetEmail(emailInput.value),emailInput.value="",Toastify({text:"Password reset email sent! Please check your inbox.",duration:3e3,gravity:"top",position:"center",backgroundColor:"#4caf50",callback:()=>{login()}}).showToast()}catch(e){Toastify({text:"An error occurred while sending the password reset email.",duration:3e3,gravity:"top",position:"center",backgroundColor:"#f44336"}).showToast()}},emailInput.addEventListener("keyup",(e=>{"Enter"===e.key&&sendResetEmail(),emailInput.value.includes("@")&&emailInput.value.includes(".")?document.getElementById("sendResetEmailButton").classList.remove("disabled"):document.getElementById("sendResetEmailButton").classList.add("disabled")})),document.getElementById("sendResetEmailButton").addEventListener("mousedown",(()=>{if(1==document.getElementById("sendResetEmailButton").classList.contains("disabled"))return Toastify({text:"Please enter a valid email address.",duration:3e3,gravity:"top",position:"center",backgroundColor:"#f44336"}).showToast();sendResetEmail()}));
