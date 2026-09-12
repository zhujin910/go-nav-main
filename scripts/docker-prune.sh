#!/bin/sh
set -eu

# 默认只显示可回收空间；生产环境必须显式传 --apply 才删除。
APPLY=false
if [ "${1:-}" = "--apply" ]; then
	APPLY=true
elif [ "${1:-}" != "" ]; then
	echo "用法：$0 [--apply]"
	exit 2
fi

if ! command -v docker >/dev/null 2>&1; then
	echo "未找到 docker 命令"
	exit 1
fi

if [ "$APPLY" = false ]; then
	echo "当前为预览模式，不会删除文件。"
	docker system df
	echo "可清理的悬空镜像："
	docker image ls --filter dangling=true
	echo "可清理的停止容器："
	docker container ls --filter status=exited --filter status=created
	echo "可清理的构建缓存："
	docker builder prune --filter until=168h --dry-run 2>/dev/null || true
	echo "执行删除请运行：$0 --apply"
	exit 0
fi

echo "清理悬空镜像..."
docker image prune -f

echo "清理 7 天前的停止容器..."
docker container prune --filter until=168h -f
echo "清理 7 天前的构建缓存..."
docker builder prune --filter until=168h -f

echo "清理完成，当前 Docker 占用："
docker system df

echo "注意：未清理 Docker volume，也未删除 go-nav-data。"
