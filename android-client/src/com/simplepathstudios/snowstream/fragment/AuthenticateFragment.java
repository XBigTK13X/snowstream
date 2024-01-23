package com.simplepathstudios.snowstream.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.R;

public class AuthenticateFragment extends Fragment {
    private String username;
    private EditText usernameField;
    private EditText passwordField;
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.authenticate_fragment, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        usernameField = view.findViewById(R.id.username_field);
        passwordField = view.findViewById(R.id.password_field);
        username = getArguments().getString("Username");
        if(username != null){
            usernameField.setText(username);
            passwordField.requestFocus();
        } else {
            usernameField.requestFocus();
        }
    }
}
