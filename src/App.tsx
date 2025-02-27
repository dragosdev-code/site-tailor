import { Route, Router, Switch } from "wouter";
import { WebsitesPresets } from "./components/WebsitesPresets";
import { useHashLocation } from "wouter/use-hash-location";
import { Layout } from "./layout/Layout";
import { SettingsPage } from "./components/Settings";
import { PresetPage } from "./components/PresetPage";

function App() {
  return (
    <>
      <Router hook={useHashLocation}>
        <Layout>
          <Switch>
            <Route path="/" component={WebsitesPresets} />
            <Route path="/presets/:id" component={PresetPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route
              path="/placeholder"
              component={() => <div>placeholder</div>}
            />
            <Route>
              <div className="p-4">
                <h1 className="text-2xl font-bold mb-2">404</h1>
                <p>Page not found.</p>
              </div>
            </Route>
          </Switch>
        </Layout>
      </Router>
    </>
  );
}

export default App;
