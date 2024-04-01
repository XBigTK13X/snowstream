package com.simplepathstudios.snowstream;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.StrictMode;
import android.view.Menu;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.activity.ComponentActivity;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.NavDestination;
import androidx.navigation.Navigation;
import androidx.navigation.ui.NavigationUI;

import com.google.android.material.navigation.NavigationView;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.fragment.tv.LoginFragment;
import com.simplepathstudios.snowstream.fragment.tv.MainFragment;
import com.simplepathstudios.snowstream.viewmodel.SettingsViewModel;

public class TvActivity extends FragmentActivity {
    private final String TAG = "TVActivity";

    @SuppressLint("ClickableViewAccessibility")
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Util.log(TAG, "Setting it up for the first time");

        Util.initApp(this);
        Util.getApp().setNavMode(Util.NavMode.FRAGMENT);

        Util.log(TAG, "Prepping settings");

        SettingsViewModel settingsViewModel = Util.getApp().getViewModel(SettingsViewModel.class);
        settingsViewModel.initialize(this.getSharedPreferences("Snowstream", Context.MODE_PRIVATE));
        SettingsViewModel.Settings settings = settingsViewModel.Data.getValue();
        ApiClient.retarget(settings.ServerUrl, settings.Username, settings.AuthToken);

        Util.log(TAG, "Inflating view");

        setContentView(R.layout.app_tv);

        Util.log(TAG, "Trying to goto the login");

        if (savedInstanceState == null) {
            Util.log(TAG, "Setting up the fragment");

            Fragment fragment = new LoginFragment();
            getSupportFragmentManager().beginTransaction().replace(R.id.tv_fragment_container, fragment)
                    .commit();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        Intent intent = getIntent();
        Util.log(TAG, "Resuming with intent " + intent.getAction());
    }

    @Override
    public void onPause() {
        super.onPause();
        Util.log(TAG, "Pausing");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Util.log(TAG, "Destroying");
    }
}
