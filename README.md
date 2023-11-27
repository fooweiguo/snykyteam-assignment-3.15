# Vulnerability Scan Workflow on Github
Referenced from Serverless Deployment exercise: [https://github.com/del-skillsunion/congenial-palm-tree](https://github.com/del-skillsunion/congenial-palm-tree)

Full reference on Vulnerability Tests for Serverless activities: [https://github.com/del-skillsunion/friendly-funicular](https://github.com/del-skillsunion/friendly-funicular)

# Activity 1:
1. Create new repo -> Person 1
2. Give access to teammates -> Person 1 & me (del-skillsunion)
3. Pull to local by all team member
4. Initialize serverless application -> Person 2 then commit & push.

# Activity 2:
5. Pull to local by all team member
6. Add index.js -> Person 3 -> Commit  & push.
7. Add serverless.yml -> Person 4 / Person 1 -> Commit  & push.
8. Add pipeline -> Person 5 / Person 2 -> Commit  & push.

### Add the followig index.js file (#Activity 2, step 6) 

```js
module.exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
            message: "Change this message",
            },
            null,
            2
        ),
    };
};
```

### Add the following serverless.yml (#Activity 2, step 7)

```yml
service: CHANGE-THIS-TO-YOUR-SERVICE-NAME
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

functions:
  api:
    handler: index.handler
    events:
      - httpApi:
          path: /
          method: get

plugins:
  - serverless-offline
```

### Add the following main.yml as the workflow pipeline (#Activity 2, step 7)

```yml
name: CICD for Serverless Application
run-name: ${{ github.actor }} is doing CICD for serverless application

on:
  push:
    branches: [ main, "*"]
```

# Activity 3:
9. NEED TO COMPLETE ALL PREV. ACTIVITY
10. Install serverless, serverless-offline
11. The pipeline need to be run
12. Run npm audit
13. Run npm audit fix (if there is vulnerability found) P2/P3
14. P2/P3 -> Commit & push if there is some changes.
15. All team mates need to pull
16. Update main.yml P1
17. Add .gitignore P2

### Update main.yml to run the pre-deploy JOB (#Activity 3, step 16)

```yml
name: CICD for Serverless Application
run-name: ${{ github.actor }} is doing CICD for serverless application

on:
  push:
    branches: [ main, "*"]

jobs:
  pre-deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event"
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by GitHub!"
      - run: echo "🔎 The name of your branch is ${{ github.ref }} and your repository is ${{ github.repository }}."

  install-dependencies:
    runs-on: ubuntu-latest
    needs: pre-deploy
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run Installation of Dependencies Commands
        run: npm install    
```

# Activity 4: (requires Snyk, therefore run npm audit instead) 

18. Update main.yml (scan), commit & push -> P3
19. Install snyk commit & push -> P4/P1
20. Create new application role in AWS and get the access_key & secret and 4. put it in github action env P5/P2
21. Update main.yml (deploy), commit & push -> P1/P3
22. For any outdated dependency use npm audit fix --force to update the dependency version
23. Then push the latest (incl. package.json with the latest dependency) 

### Update main.yml again to run a scan for vulnerable dependencies (#Activity 4, step 18)

```yml
name: CICD for Serverless Application
run-name: ${{ github.actor }} is doing CICD for serverless application

on:
  push:
    branches: [ main, "*"]

jobs:
  pre-deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event"
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by GitHub!"
      - run: echo "🔎 The name of your branch is ${{ github.ref }} and your repository is ${{ github.repository }}."

  install-dependencies:
    runs-on: ubuntu-latest
    needs: pre-deploy
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run Installation of Dependencies Commands
        run: npm install
    
  scan-dependencies:
    runs-on: ubuntu-latest
    needs: install-dependencies
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run Scanning of Dependencies Commands
        run: npm audit    
```

# Activity 5: (perform unit test) 

24. Install Jest unit test package
25. Update package.json where script is found: "test" : "jest"
26. Create a test file called index.test.js
27. Push the code (including the updated main.yml below) to run on github actions.
28. The github workflow will ONLY be interupted if index.test.js has a different reponse from index.js.

### Update main.yml again to run a scan for vulnerable dependencies (#Activity 5, step 27)

```yml
name: CICD for Serverless Application
run-name: ${{ github.actor }} is doing CICD for serverless application

on:
  push:
    branches: [ main, "*" ]

jobs:
  pre-deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "The job is automatically triggered by a ${{ github.event_name }} event."

  install-dependencies:
    runs-on: ubuntu-latest
    needs: pre-deploy
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run installation of dependencies commands
        run: npm install

  unit-testing:
    runs-on: ubuntu-latest
    needs: install-dependencies
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run installation of dependencies commands
        run: npm install
      - name: Run unit testing command
        run: npm test
  
  package-scan:
    runs-on: ubuntu-latest
    needs: unit-testing
    steps:
      - name: Check out repository code
        uses: actions/checkout@v3
      - name: Run installation of dependencies commands
        run: npm install
      - name: Run audit
        run: npm audit

  deploy:
    name: deploy
    runs-on: ubuntu-latest
    needs: package-scan
    strategy:
      matrix:
        node-version: [18.x]
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - name: serverless deploy
      uses: serverless/github-action@v3.2
      with:
        args: deploy
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Logging

Here is the image of the logging from cloudwatch.

![Image of the Log File](https://github.com/fooweiguo/snykyteam-assignment-3.15/blob/main/Screenshot%202023-11-27%20at%208.54.00%20PM.png)
