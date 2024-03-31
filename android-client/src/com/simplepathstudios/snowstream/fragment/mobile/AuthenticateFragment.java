package com.simplepathstudios.snowstream.fragment.mobile;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;

import com.simplepathstudios.snowstream.MobileActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.api.model.SnowstreamAuthToken;
import com.simplepathstudios.snowstream.viewmodel.SettingsViewModel;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AuthenticateFragment extends Fragment {
    private EditText usernameField;
    private EditText passwordField;
    private Button loginButton;
    private SettingsViewModel settingsViewModel;
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.mobile_authenticate_fragment, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        settingsViewModel = new ViewModelProvider(getActivity()).get(SettingsViewModel.class);

        usernameField = view.findViewById(R.id.username_field);
        passwordField = view.findViewById(R.id.password_field);
        String chosenUsername = getArguments().getString("Username");
        if(chosenUsername != null){
            usernameField.setText(chosenUsername);
            passwordField.requestFocus();
        } else {
            usernameField.requestFocus();
        }
        loginButton = view.findViewById(R.id.login_button);
        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String username = usernameField.getText().toString();
                String password = passwordField.getText().toString();
                ApiClient.getInstance().login(username,password).enqueue(new Callback<SnowstreamAuthToken>() {
                            @Override
                            public void onResponse(Call<SnowstreamAuthToken> call, Response<SnowstreamAuthToken> response) {
                                settingsViewModel.setAuthToken(username, response.body());
                                Util.navigateTo(R.id.home_fragment);
                            }

                            @Override
                            public void onFailure(Call<SnowstreamAuthToken> call, Throwable t) {
                                Util.toast("Incorrect username or password.");
                            }
                        });
            }
        });
    }
}
