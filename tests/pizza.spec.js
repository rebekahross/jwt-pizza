import { test, expect } from "playwright-test-coverage";

test("home page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
});

test("purchase with login", async ({ page }) => {
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  await page.route("*/**/api/franchise", async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: "LotaPizza",
        stores: [
          { id: 4, name: "Lehi" },
          { id: 5, name: "Springville" },
          { id: 6, name: "American Fork" },
        ],
      },
      { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
      { id: 4, name: "topSpot", stores: [] },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "d@jwt.com", password: "a" };
    const loginRes = {
      user: {
        id: 3,
        name: "Kai Chen",
        email: "d@jwt.com",
        roles: [{ role: "diner" }],
      },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route("*/**/api/order", async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: "Veggie", price: 0.0038 },
        { menuId: 2, description: "Pepperoni", price: 0.0042 },
      ],
      storeId: "4",
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: "Veggie", price: 0.0038 },
          { menuId: 2, description: "Pepperoni", price: 0.0042 },
        ],
        storeId: "4",
        franchiseId: 2,
        id: 23,
      },
      jwt: "eyJpYXQ",
    };
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto("http://localhost:5173/");

  // Go to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Create order
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Pay
  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!"
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  // Check balance
  await expect(page.getByText("0.008")).toBeVisible();
});

test("create franchise", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    const loginReq = { email: "a@jwt.com", password: "admin" };
    const loginRes = {
      user: {
        id: 3,
        name: "Kai Chen",
        email: "a@jwt.com",
        roles: [{ role: "admin" }],
      },
      token: "abcdef",
    };
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route("*/**/api/franchise", async (route) => {
    if (route.request().method() == "POST") {
      const franchiseReq = {
        name: "New franchise",
        admins: [
          {
            email: "f@jwt.com",
          },
        ],
      };
      const franchiseRes = [
        {
          id: 1,
          name: "New franchise",
          admins: [{ email: "f@jwt.com", id: 1, name: "franchisee" }],
        },
      ];
      expect(route.request().method()).toBe("POST");
      expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
      await route.fulfill({ json: franchiseRes });
    } else if (route.request().method() == "GET") {
      const franchiseRes = [
        {
          id: 1,
          name: "New franchise",
          stores: [],
          admins: [{ id: 2, name: "franchisee", email: "f@jwt.com" }],
        },
      ];
      expect(route.request().method()).toBe("GET");
      await route.fulfill({ json: franchiseRes });
    }
  });

  await page.goto("http://localhost:5173/");

  // Login
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").fill("a@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("admin");
  await page.getByRole("button", { name: "Login" }).click();

  expect(page.getByRole("link", { name: "Admin" })).toBeVisible();

  // go to admin dashboard
  await page.getByRole("link", { name: "Admin" }).click();

  // Create franchise
  expect(page.getByRole("button", { name: "Add Franchise" })).toBeVisible();
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByPlaceholder("franchise name").fill("New franchise");
  await page.getByPlaceholder("franchise name").press("Tab");
  await page.getByPlaceholder("franchisee admin email").fill("f@jwt.com");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByRole("cell", { name: "New franchise" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "franchisee" })).toBeVisible();

  // await expect(page.getByRole("cell", { name: "Pizza" })).toBeVisible();
  // await page.getByRole("cell", { name: "franchisee" }).nth(1).click();
  // await page.getByRole("cell", { name: "Close" }).nth(1).click();
  // await page.getByRole("button", { name: "Cancel" }).click();
});

test("logout with login", async ({ page }) => {
  await page.route("*/**/api/auth", async (route) => {
    if (route.request().method() == "PUT") {
      const loginReq = { email: "d@jwt.com", password: "a" };
      const loginRes = {
        user: {
          id: 3,
          name: "Kai Chen",
          email: "d@jwt.com",
        },
        token: "abcdef",
      };
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    } else if (route.request().method() == "DELETE") {
      const logoutRes = {
        message: "logout successful",
      };
      await route.fulfill({ json: logoutRes });
    }
  });

  await page.goto("http://localhost:5173/");

  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  await page.getByRole("link", { name: "Login" }).click();

  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await page.goto("http://localhost:5173/");

  await expect(page.getByRole("link", { name: "Login" })).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();

  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page.getByRole("link", { name: "Logout" })).not.toBeVisible();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
});

// test("logout with login v2", async ({ page }) => {
//   await page.goto("http://localhost:5173/");

//   await page.getByRole("link", { name: "Login" }).click();
//   await page.getByPlaceholder("Email address").click();
//   await page.getByPlaceholder("Email address").fill("a@jwt.com");
//   await page.getByPlaceholder("Email address").press("Tab");
//   await page.getByPlaceholder("Password").fill("admin");
//   await page.getByRole("button", { name: "Login" }).click();
//   await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
//   await page.getByRole("link", { name: "Logout" }).click();
// });
