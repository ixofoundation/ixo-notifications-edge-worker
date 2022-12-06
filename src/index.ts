import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'


export interface Bindings {
  Notifications: KVNamespace
}

const app = new Hono()

app.use('*', poweredBy())

app.get('/', (c) => {

  return c.text('Hello ixo-tc!')
})

app.post('/createNotification', async (c) => {
  
  const body = await c.req.json();

  try {
    await c.env.Notifications.put("Notifications", JSON.stringify(body));
  } catch (error) {
    console.log(error);
    
  }


  return c.text(JSON.stringify(body))
});

app.post('/storeNotificationsAirtable', async (c) => {
  
  const body = await c.req.json();

  try {
    await c.env.Notifications.put("Notifications", JSON.stringify(body));
  } catch (error) {
    console.log(error);
    
  }


  return c.text(JSON.stringify(body))
});

app.get('/getNotification/:did', async (c) => {
  const did = c.req.param('did')
  let Notifications = await c.env.Notifications.get("Notifications");
  let userspecific = [];
for (let index = 0; index < Notifications.length; index++) {
    const element = Notifications[index];
    if(element.Status != "Expired" && element.DID === did){

      userspecific.push(element);


    }
  }
  return c.text(JSON.stringify(userspecific));
});



export default app
