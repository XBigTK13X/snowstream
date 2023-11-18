import React from "react";
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
} from "@mantine/core";
import classes from "./login.module.css";

import { useContext } from "react";
import { ApiClientContext } from "../contexts";

class ContextualizedLoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.apiClient = this.props.apiClient;

    this.state = {
      auth: null,
    };
    this.changeForm = this.changeForm.bind(this);
    this.login = this.login.bind(this);
  }
  changeForm(ev) {
    this.setState({
      [ev.target.name]: ev.target.value,
    });
  }
  login() {
    console.log({ state: this.state });
    const payload = {
      username: this.state.username,
      password: this.state.password,
    };
    this.apiClient
      .login(payload)
      .then((success) => {})
      .catch((failure) => {});
  }
  render() {
    return (
      <Container size={420} my={40}>
        <Title ta="center" className={classes.title}>
          snowstream
        </Title>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput
            onChange={this.changeForm}
            label="Username"
            name="username"
            placeholder="username"
            required
          />
          <PasswordInput
            onChange={this.changeForm}
            label="Password"
            name="password"
            placeholder="password"
            required
            mt="md"
          />
          <Button onClick={this.login} fullWidth mt="xl">
            Log in
          </Button>
        </Paper>
      </Container>
    );
  }
}

export default function LoginPage() {
  let apiClient = useContext(ApiClientContext);

  return (
    <ContextualizedLoginPage apiClient={apiClient}></ContextualizedLoginPage>
  );
}
