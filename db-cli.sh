#!/bin/bash

# Codes de couleur pour l'affichage
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Pas de couleur

DB_NAME="london_academy"

# Vérifier si Docker et le conteneur DB tournent
if ! docker compose ps db | grep -q "Up"; then
    echo -e "${RED}Erreur : Le conteneur de base de données (db) n'est pas démarré.${NC}"
    echo "Lance d'abord : docker compose up -d"
    exit 1
fi

# Fonction pour exécuter une commande mongosh rapide
run_mongo_cmd() {
    docker compose exec -T db mongosh "$DB_NAME" --quiet --eval "$1"
}

# Fonction pour entrer dans le shell interactif
enter_shell() {
    echo -e "${GREEN}Connexion au Shell MongoDB pour '$DB_NAME'... (Tape 'exit' pour quitter)${NC}"
    docker compose exec -it db mongosh "$DB_NAME"
}

while true; do
    echo -e "\n${CYAN}=========================================${NC}"
    echo -e "${CYAN}       LONDON ACADEMY - CLI BDD          ${NC}"
    echo -e "${CYAN}=========================================${NC}"
    echo "1) Lister toutes les collections"
    echo "2) Voir les documents d'une collection"
    echo "3) Rechercher / Requêter (JSON)"
    echo "4) Mettre à jour un document (Update)"
    echo "5) Supprimer un document (Delete)"
    echo "6) Ouvrir le Shell interactif (mongosh)"
    echo "7) Sauvegarder la BDD (mongodump gzippé)"
    echo "8) Quitter"
    echo -e "${CYAN}=========================================${NC}"
    read -p "Choisis une option [1-8] : " opt

    case $opt in
        1)
            echo -e "\n${YELLOW}--- Collections dans $DB_NAME ---${NC}"
            run_mongo_cmd "db.getCollectionNames().join('\n')"
            ;;
        2)
            read -p "Nom de la collection : " col
            read -p "Limite de résultats (par défaut 10) : " limit
            limit=${limit:-10}
            echo -e "\n${YELLOW}--- $limit derniers documents de '$col' ---${NC}"
            run_mongo_cmd "db.$col.find().limit($limit).toArray()"
            ;;
        3)
            read -p "Nom de la collection : " col
            read -p "Requête de recherche en JSON (ex: {email: 'teacher@londonacademy.co.il'}) : " query
            query=${query:-"{}"}
            echo -e "\n${YELLOW}--- Résultats de la recherche ---${NC}"
            run_mongo_cmd "db.$col.find($query).toArray()"
            ;;
        4)
            read -p "Nom de la collection : " col
            read -p "Filtre JSON pour cibler le document (ex: {email: 'ancien@mail.com'}) : " filter
            read -p "Modification en JSON (ex: {\$set: {email: 'nouveau@mail.com'}}) : " update
            if [ -n "$filter" ] && [ -n "$update" ]; then
                echo -e "\n${YELLOW}--- Modification en cours ---${NC}"
                run_mongo_cmd "db.$col.updateOne($filter, $update)"
            else
                echo -e "${RED}Le filtre et la modification ne peuvent pas être vides.${NC}"
            fi
            ;;
        5)
            read -p "Nom de la collection : " col
            read -p "Filtre de suppression en JSON (ex: {email: 'test@test.com'}) : " filter
            if [ -n "$filter" ]; then
                read -p "Es-tu sûr de vouloir supprimer ? (y/N) : " confirm
                if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
                    run_mongo_cmd "db.$col.deleteOne($filter)"
                else
                    echo "Annulé."
                fi
            fi
            ;;
        6)
            enter_shell
            ;;
        7)
            BACKUP_DIR="./backups"
            mkdir -p "$BACKUP_DIR"
            FILE_NAME="backup_${DB_NAME}_$(date +%F_%H-%M-%S).tar.gz"
            echo -e "${YELLOW}Sauvegarde en cours...${NC}"
            docker compose exec -T db mongodump --db "$DB_NAME" --archive --gzip > "$BACKUP_DIR/$FILE_NAME"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Sauvegarde réussie ! Fichier créé : $BACKUP_DIR/$FILE_NAME${NC}"
            else
                echo -e "${RED}Échec de la sauvegarde.${NC}"
            fi
            ;;
        8)
            echo -e "${GREEN}À la prochaine !${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Option invalide, réessaie.${NC}"
            ;;
    esac
done
