package com.simplepathstudios.snowstream.fragment.mobile;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.MobileActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.adapter.UserListAdapter;
import com.simplepathstudios.snowstream.viewmodel.SettingsViewModel;
import com.simplepathstudios.snowstream.viewmodel.UserListViewModel;

import java.util.List;

public class LoginFragment extends Fragment {
    private static final String TAG = "LoginFragment";
    private UserListViewModel userListViewModel;
    private RecyclerView listElement;
    private LinearLayoutManager layoutManager;
    private UserListAdapter userListAdapter;
    private SettingsViewModel settingsViewModel;
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.mobile_login_fragment, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        settingsViewModel = Util.getViewModel(SettingsViewModel.class);
        settingsViewModel.Data.observe(getViewLifecycleOwner(),settings -> {
            if(settings == null || settings.AuthToken == null){
                listElement = view.findViewById(R.id.user_list);
                userListAdapter = new UserListAdapter();
                listElement.setAdapter(userListAdapter);
                layoutManager = new LinearLayoutManager(getActivity());
                listElement.setLayoutManager(layoutManager);
                userListViewModel = Util.getViewModel(UserListViewModel.class);
                userListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<String>>() {
                    @Override
                    public void onChanged(List<String> userList) {
                        userListAdapter.setData(userList);
                        userListAdapter.notifyDataSetChanged();
                    }
                });
                Util.log(TAG, "Trying to load users");
                userListViewModel.load();
            } else {
                Util.log(TAG, "Trying to navigate home");
                Util.navigateTo(R.id.home_fragment);
            }
        });
        Util.log(TAG, "Launching the login fragment");
    }
}
