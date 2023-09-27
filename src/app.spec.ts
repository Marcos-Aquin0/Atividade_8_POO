import sinon from "sinon"
import { App } from "./app"
import { Bike } from "./bike"
import { User } from "./user"
import { Location } from "./location"
import { Crypt } from "./crypt";
import crypto from 'crypto'
import { BikeNotFoundError } from "./errors/bike-not-found-error"
import { UnavailableBikeError } from "./errors/unavailable-bike-error"
import { UserNotFoundError } from "./errors/user-not-found-error"
import { YouCantReturnThisBikeError } from "./errors/you-cant-return-this-bike-error"

describe('App', () => {

// findUser
    it('should throw user not found error when user is not found', () => {
        const app = new App()
        expect(() => {
            app.findUser('fake@mail.com')
        }).toThrow(UserNotFoundError)
    })

// registerUser
    it('should correctly register a user', () => {
        const user = new User('Jose', 'jose@mail.com', '1234')
        const app = new App()
        app.registerUser(user);
        expect(user.id).toBeDefined();
        expect(user.name).toBe('Jose');
        expect(user.email).toBe('jose@mail.com');
        expect(user.password).toBe(1234);
    })

    // authenticate
    it('should return true when user authentication is successful', async () => {
        const app = new App();
        const userEmail = 'jose@mail.com';
        const userPassword = '1234';
    
        const isAuthenticated = await app.authenticate(userEmail, userPassword);
        expect(isAuthenticated).toBe(true);
    });

    
    it('should return false when user authentication fails', async () => {
        const app = new App();
        const userEmail = 'jose@mail.com';
        const userPassword = '1234';
    
        const isAuthenticated = await app.authenticate(userEmail, userPassword);
        expect(isAuthenticated).toBe(false);
    });

// registerBike
    it('should correctly register a bike', () => {
        const bike = new Bike('caloi mountainbike', 'mountain bike',
        1234, 1234, 100.0, 'My bike', 5, [])
        const app = new App()
        app.registerBike(bike);

        expect(bike.id).toBeDefined();
        expect(bike.name).toBe('caloi mountainbike');
        expect(bike.type).toBe('moutain bike');
        expect(bike.bodySize).toBe(1234);
        expect(bike.maxLoad).toBe(1234);
        expect(bike.rate).toBe(100.0);
        expect(bike.description).toBe('My bike');
        expect(bike.ratings).toBe(5);
        expect(bike.imageUrls).toBe([]);
        expect(bike.available).toBeTruthy()
    }); 

// removeUser
  it('should correctly remove a user', () => {
    const user = new User('Jose', 'jose@mail.com', '1234')
    const app = new App()
    app.registerUser(user)
    app.removeUser('jose@mail.com')
    expect(user).toBeUndefined();
  })

// rentBike
    it('should correctly handle a bike rent', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)
        app.rentBike(bike.id, user.email)
        expect(app.rents.length).toEqual(1)
        expect(app.rents[0].bike.id).toEqual(bike.id)
        expect(app.rents[0].user.email).toEqual(user.email)
        expect(bike.available).toBeFalsy()
    })

    it('should throw unavailable bike when trying to rent with an unavailable bike', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)
        app.rentBike(bike.id, user.email)
        expect(() => {
            app.rentBike(bike.id, user.email)
        }).toThrow(UnavailableBikeError)
    })

// returnBike
    it('should be able to return a bike correctly and calculate the rent amount', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)
        const clock = sinon.useFakeTimers();
        app.rentBike(bike.id, user.email)
        const hour = 1000 * 60 * 60
        clock.tick(2 * hour)
        const rentAmount = app.returnBike(bike.id, user.email)
        expect(rentAmount).toEqual(200.0)
    })

    it('should throw you cant return this bike error when rent is not found', () => {
        const app = new App()
        expect(() => {
            app.returnBike('fakeBikeID', 'fake@mail')
        }).toThrow(YouCantReturnThisBikeError)
    })

// moveBikeTo
    it('should be able to move a bike to a specific location', () => {
        const app = new App()
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)
        const newYork = new Location(40.753056, -73.983056)
        app.moveBikeTo(bike.id, newYork)
        expect(bike.location.latitude).toEqual(newYork.latitude)
        expect(bike.location.longitude).toEqual(newYork.longitude)
    })

    it('should throw an exception when trying to move an unregistered bike', () => {
        const app = new App()
        const newYork = new Location(40.753056, -73.983056)
        expect(() => {
            app.moveBikeTo('fake-id', newYork)
        }).toThrow(BikeNotFoundError)
    })

// findbike
    it('should throw bike not found error when bike is not found', () => {
        const app = new App()
        expect(() => {
            app.findBike('fakeBikeID')
        }).toThrow(BikeNotFoundError)
    })
})