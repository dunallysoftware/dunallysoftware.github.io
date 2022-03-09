export default class CollisionCircle {

    radius;
    x_offset;
    y_offset;

    constructor(radius, x_offset, y_offset)
    {
        this.radius = radius;
        this.x_offset = x_offset;
        this.y_offset = y_offset;
    }

    // Check specific circles on two objects - (because an object can have >1 circle)
    collidedWithCircle(gameObject1, gameObject2, circle2)
    {

        let triangleX=(gameObject1.x + this.x_offset)-(gameObject2.x + circle2.x_offset);
        let triangleY=(gameObject1.y + this.y_offset)-(gameObject2.y + circle2.y_offset);

        let hypotenuse = Math.sqrt((triangleX*triangleX) + (triangleY*triangleY));
        return (hypotenuse < this.radius+circle2.radius);
    }
}
