# check if git repo is updated
# if updated, pull the latest code
# if not, do nothing

import os
import subprocess
import time

#check if dhooks is installed
try:
    import dhooks
except ImportError:
    print("dhooks is not installed. Installing...")
    os.system("pip install dhooks")
    print("dhooks installed.")
from dhooks import Webhook

def checkGitUpdate():
    #Check prod branch latest commit hash on github
    
    # get the latest commit hash of the prod branch from github
    githubCommitHash = subprocess.check_output('git ls-remote', shell=True).split()[4]
    # get the latest commit hash of the prod branch from local
    localCommitHash = subprocess.check_output('git rev-parse HEAD', shell=True).split()[0]

    print("Github commit")
    print(githubCommitHash)
    print(localCommitHash)

    # compare the two commit hashes
    if githubCommitHash == localCommitHash:
        return False
    else:
        return True

        

def pullLatestCode():
    # pull the latest code
    os.system('git pull')

def restartNode():
    # kill the node process
    os.system("taskkill /f /im node.exe")
    # start the node process
    os.system("start node .")
def sendWebhook():
    hook = Webhook('https://ptb.discord.com/api/webhooks/1076609674717171784/E-OtSAHfc_GkldVuSH8MrJQW8fNWi7WaWJVzk0VbeU1ZLnfkzzK7WRU8XTw9yJLd-UpS')
    hook.send('Server has pulled the latest prod code from github.')

if __name__ == '__main__':
    #start node
    os.system("start node .")

    #loop forever
    while True:
        if checkGitUpdate():
            pullLatestCode()
            sendWebhook()
            restartNode()
        
        time.sleep(300)

    