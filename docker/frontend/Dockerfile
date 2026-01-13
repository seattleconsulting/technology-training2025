# ベースイメージの指定
FROM node:lts-alpine3.20

# 作業ディレクトリの指定
WORKDIR /workspace/frontend

# create-react-appをインストール
RUN npm install -g create-react-app

# package.jsonをコピー
COPY ./frontend/package*.json ./

# 依存関係をインストール
RUN npm install