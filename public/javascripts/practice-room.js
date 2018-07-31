document.addEventListener('DOMContentLoaded', (e) => {
    const rackets = document.getElementsByClassName('tt-racket');
    const balls = document.getElementsByClassName('tt-ball');
    const tables = document.getElementsByClassName('tt-table');
    const ground = document.querySelector('#ground');

    ground.addEventListener('body-loaded', (e) => {
        const world = ground.body.world;
        const racketMaterial = new CANNON.Material();
        const ballMaterial = new CANNON.Material();
        const tableMaterial = new CANNON.Material();

        //Create ball/racket and ball/table Collision Materials and them to the world
        const racket_ball = new CANNON.ContactMaterial(racketMaterial, ballMaterial, {friction: 0.5, restitution: 0.9});
        const ball_table = new CANNON.ContactMaterial(tableMaterial, ballMaterial, {friction: 0.1, restitution: 0.9});
        world.addContactMaterial(racket_ball);
        world.addContactMaterial(ball_table);

        //Set the materials
        for (const racket of rackets) {
            console.log('Assigning racket material');
            if (racket.body) {
                racket.body.material = racketMaterial;
            } else {
                racket.addEventListener('body-loaded', (e) => {
                    racket.body.material = racketMaterial;
                });
            }
        }
    
        for (const ball of balls) {
            console.log('Assigning ball material');
            if (ball.body) {
                ball.body.material = ballMaterial;
            }
            ball.addEventListener('body-loaded', (e) => {
                ball.body.material = ballMaterial;
            });
        }
    
        for (const table of tables) {
            console.log('Assigning table material');
            if (table.body) {
                table.body.material = tableMaterial;
            } else {
                table.addEventListener('body-loaded', (e) => {
                    table.body.material = tableMaterial;
                });
            }
        }
    });
});