import java.text.SimpleDateFormat
def TODAY = (new SimpleDateFormat("yyyyMMddHHmmss")).format(new Date())
pipeline {
    agent any
    tools {
        nodejs 'NodeJS_24'
    }
    environment {
        strDockerTag = "${TODAY}_${BUILD_ID}"
        strDockerImage ="530hyelim/cicd_ypjp:${strDockerTag}"
        strGitUrl = "https://github.com/kh-powerpuffgirls/yoripick-joripick.git"
    }
    stages {
        // 1. 깃헙 체크아웃(master)
        stage('Checkout') {
            steps {
                git branch: 'master', url: strGitUrl
            }
        }
        // 2. 소스코드 빌드
        stage('Build') {
            steps {
                sh '''
                    echo "🔧 Installing dependencies..."
                    npm install
        
                    echo "🏗️ Building project..."
                    npm run build
                '''
            }
        }
        // 3. 도커 이미지 빌드
        stage('Docker Image Build') {
            steps {
                script {
                    oDockImage = docker.build(strDockerImage, "--build-arg VERSION="+strDockerTag+" -f Dockerfile .")
                }
            }
        }
        // 4. 도커 이미지 푸쉬
        stage('Docker Image Push') {
            steps {
                script {
                    docker.withRegistry('', 'Dockerhub_Cred') {
                        oDockImage.push()
                    }
                }
            }
        }
        // 5. 프로덕션 서버 배포
        stage('Deploy Production') {
            steps {
                sshagent(credentials: ['SSH-PrivateKey']) {
                    sh "ssh -o StrictHostKeyChecking=no ec2-user@43.203.124.138 docker container rm -f ypjp"
                    sh "ssh -o StrictHostKeyChecking=no ec2-user@43.203.124.138 docker container run \
                        -d \
                        -p 80:80 -p 443:443 \
                        -v /etc/letsencrypt/live/front.ypjp.store/fullchain.pem:/etc/letsencrypt/live/front.ypjp.store/fullchain.pem \
                        -v /etc/letsencrypt/live/front.ypjp.store/privkey.pem:/etc/letsencrypt/live/front.ypjp.store/privkey.pem \
                        -v /home/ec2-user/nginx.conf:/etc/nginx/conf.d/default.conf \
                        --name=ypjp \
                        ${strDockerImage}"
                }
            }
        }
    }
}
