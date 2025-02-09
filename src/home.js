import { useEffect, useState } from "react";
import axios from "axios";
import { Empty } from "antd";
import Content from "./components/content/content";
import Grid from "@material-ui/core/Grid";
import { CartProvider } from "react-use-cart";
import Check from "./components/check/check";
import { useHistory } from "react-router-dom";
import { MobileView, isMobileOnly } from "react-device-detect";
import Bottomcart from "./components/bottomCart/bottomcart";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import RestoreIcon from "@material-ui/icons/Restore";
import HomeIcon from "@material-ui/icons/Home";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import Badge from "@material-ui/core/Badge";
import LazyLoad from "react-lazyload";
import { useCart } from "react-use-cart";
import "./components/search/search.css";
import { io } from "socket.io-client";

const ip = "http://localhost:4000";
const socket = io(ip);

const useStyles = makeStyles({
  stickToBottom: {
    zIndex: "2",
    width: "100%",
    position: "fixed",
    bottom: 0,
  },
  root: {
    width: 500,
  },
});
const StyledBadge = withStyles((theme) => ({
  badge: {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}))(Badge);
function Home() {
  const { totalItems } = useCart();

  const [data, setData] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [opens, setOpens] = useState(false);

  const [count, setCount] = useState(totalItems);
  let history = useHistory();

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams(window.location.search);
    const token = query.get("table");
    sessionStorage.setItem("table", token);
    setTimeout(() => {
      (async function () {
        axios
          .get(`${ip}/data`)
          .then((res) => {
            setData(res.data);
            setLoading(false);
          })
          .catch(() => {
            setError(true);
          });
      })();
    }, 1000);
  }, []);

  if (error === true)
    return (
      <Empty
        description="Server is not working please refresh page or contact administrator"
        style={{ marginTop: "200px" }}
      />
    );
  return (
    <div>
      <CartProvider
        onItemAdd={() => setCount(count + 1)}
        onItemUpdate={() => setCount(count + 1)}
        onItemRemove={() => setCount(count - 1)}
      >
        <MobileView>
          <Bottomcart soclopens={opens} ip={ip} func={setOpens} />
        </MobileView>

        <Grid container spacing={1}>
          {/* <Grid item xs={12} lg={12} sm={12}>
            <Search loading={loading} data={data} />
          </Grid> */}
          <Grid item xs={12} md={8} lg={9} sm={12}>
            <LazyLoad once={true}>
              <Content loading={loading} ip={ip} data={data} />
            </LazyLoad>
          </Grid>
          <Grid item xs={12} md={4} lg={3} sm={12}>
            {isMobileOnly ? null : <Check socket={socket} ip={ip} />}
          </Grid>
        </Grid>

        {isMobileOnly ? (
          <BottomNavigation
            ip={ip}
            socket={socket}
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
            showLabels
            className={classes.stickToBottom}
          >
            <BottomNavigationAction label="Asosiy" icon={<HomeIcon />} />
            <BottomNavigationAction
              onClick={() => setOpens(true)}
              label="Savatcha"
              icon={
                <StyledBadge showZero badgeContent={count} color="secondary">
                  <ShoppingCartIcon />
                </StyledBadge>
              }
            />
            <BottomNavigationAction
              onClick={() => history.push("/check")}
              label="Buyurtmalar tarixi"
              icon={<RestoreIcon />}
            />
          </BottomNavigation>
        ) : null}
      </CartProvider>
    </div>
  );
}

export default Home;
