docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

docker network prune
docker network rm $(docker network ls -q) 2>/dev/null

docker volume prune
docker volume rm $(docker volume ls -q)

docker rmi $(docker images -a -q)

docker builder prune

docker system prune